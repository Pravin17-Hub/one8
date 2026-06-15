import { query } from '../config/db.js';

/**
 * Processes the completion of an auction:
 * Marks status as COMPLETED, creates a pending order for the winner, and sends a notification.
 */
export const processAuctionCompletion = async (auctionId) => {
  try {
    // 1. Fetch auction details
    const auctionRes = await query('SELECT * FROM auctions WHERE id = $1', [auctionId]);
    if (auctionRes.rows.length === 0) return;
    const auction = auctionRes.rows[0];

    // 2. Mark auction as completed in database (stamping ends_at if it was manually ended early)
    await query("UPDATE auctions SET status = 'COMPLETED', ends_at = LEAST(ends_at, CURRENT_TIMESTAMP) WHERE id = $1", [auctionId]);

    // 3. Find highest bid and winner
    if (auction.highest_bidder_id && parseFloat(auction.current_highest_bid) > 0) {
      const winnerId = auction.highest_bidder_id;
      const amount = auction.current_highest_bid;

      // Check if order already exists for this auction to avoid duplicates
      const orderExists = await query('SELECT id FROM orders WHERE auction_id = $1 AND status != \'CANCELLED\'', [auctionId]);
      if (orderExists.rows.length > 0) {
        return; // Already has a valid order
      }

      // Create a pending order for the winner
      // Note: address_id is NULL initially. The winner will fill this when they complete checkout/payment.
      const orderRes = await query(`
        INSERT INTO orders (customer_id, address_id, total_amount, status, payment_status, auction_id)
        VALUES ($1, NULL, $2, 'PENDING', 'PENDING', $3)
        RETURNING id
      `, [winnerId, amount, auctionId]);

      const orderId = orderRes.rows[0].id;

      // Add order item for the auction product
      await query(`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
        VALUES ($1, $2, 1, $3)
      `, [orderId, auction.product_id, amount]);

      // Send notification to the winner
      const productRes = await query('SELECT title FROM products WHERE id = $1', [auction.product_id]);
      const productTitle = productRes.rows[0]?.title || 'Auction Product';

      const notifTitle = 'Auction Won! Action Required';
      const notifMsg = `Congratulations! You won the auction for "${productTitle}" with a bid of ₹${amount}. You have 24 hours to complete your payment and purchase the item, or your account will face a trust score penalty.`;
      
      await query(`
        INSERT INTO notifications (user_id, title, message)
        VALUES ($1, $2, $3)
      `, [winnerId, notifTitle, notifMsg]);
      
      console.log(`Processed auction completion for ${auctionId}. Winner: ${winnerId}, Order: ${orderId}`);
    }
  } catch (error) {
    console.error('Error in processAuctionCompletion:', error);
  }
};

/**
 * Checks for pending auction checkout orders that have been unpaid for more than 24 hours.
 * Cancels them, applies user penalty/suspension, and offers the item to the runner-up bidder.
 */
export const checkUnpaidAuctions = async () => {
  try {
    // Find all pending/unpaid auction orders older than 24 hours
    const unpaidOrdersRes = await query(`
      SELECT o.id as order_id, o.customer_id, o.total_amount, o.auction_id, o.created_at,
             a.product_id
      FROM orders o
      JOIN auctions a ON o.auction_id = a.id
      WHERE o.auction_id IS NOT NULL 
        AND o.status = 'PENDING'
        AND o.payment_status = 'PENDING'
        AND o.created_at <= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `);

    for (const order of unpaidOrdersRes.rows) {
      console.log(`Auction order ${order.order_id} has expired unpaid. Processing penalty and runner-up...`);

      // Begin transaction to ensure consistency
      await query('BEGIN');

      try {
        // 1. Cancel the current order
        await query(`
          UPDATE orders 
          SET status = 'CANCELLED' 
          WHERE id = $1
        `, [order.order_id]);

        // 2. Penalize the defaulting user: deduct 30 from trust_score
        await query(`
          UPDATE users 
          SET trust_score = GREATEST(0, trust_score - 30)
          WHERE id = $1
        `, [order.customer_id]);

        // Retrieve current trust score to check for suspension
        const userRes = await query('SELECT trust_score FROM users WHERE id = $1', [order.customer_id]);
        const trustScore = userRes.rows[0].trust_score;
        let isSuspended = false;

        if (trustScore < 50) {
          isSuspended = true;
          await query(`
            UPDATE users 
            SET is_suspended = TRUE 
            WHERE id = $1
          `, [order.customer_id]);
        }

        // Notify defaulting user about penalty
        const productRes = await query('SELECT title FROM products WHERE id = $1', [order.product_id]);
        const productTitle = productRes.rows[0]?.title || 'Auction Product';

        const notifTitle = 'Penalty: Unpaid Auction Order';
        const notifMsg = `You failed to pay for "${productTitle}" within the 24-hour limit. Your trust score has been reduced by 30. Current trust score: ${trustScore}.${
          isSuspended ? ' Your account is now suspended due to a low trust score.' : ''
        }`;
        await query(`
          INSERT INTO notifications (user_id, title, message)
          VALUES ($1, $2, $3)
        `, [order.customer_id, notifTitle, notifMsg]);

        // 3. Find the next highest bidder for this auction
        const bidsRes = await query(`
          SELECT user_id, bid_amount 
          FROM auction_bids 
          WHERE auction_id = $1 AND user_id != $2
          ORDER BY bid_amount DESC, created_at ASC
          LIMIT 1
        `, [order.auction_id, order.customer_id]);

        if (bidsRes.rows.length > 0) {
          const runnerUp = bidsRes.rows[0];
          const runnerUpId = runnerUp.user_id;
          const runnerUpAmount = runnerUp.bid_amount;

          // Update auction table to reflect runner up (so if they fail, we can repeat)
          await query(`
            UPDATE auctions 
            SET current_highest_bid = $1, highest_bidder_id = $2 
            WHERE id = $3
          `, [runnerUpAmount, runnerUpId, order.auction_id]);

          // Create a new order for the runner up (with a fresh 24h timer starting now)
          const newOrderRes = await query(`
            INSERT INTO orders (customer_id, address_id, total_amount, status, payment_status, auction_id)
            VALUES ($1, NULL, $2, 'PENDING', 'PENDING', $3)
            RETURNING id
          `, [runnerUpId, runnerUpAmount, order.auction_id]);

          const newOrderId = newOrderRes.rows[0].id;

          // Add order item for the auction product
          await query(`
            INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
            VALUES ($1, $2, 1, $3)
          `, [newOrderId, order.product_id, runnerUpAmount]);

          // Send notification to the runner up
          const runnerUpNotifTitle = 'Auction Opportunity: You are the Runner-Up!';
          const runnerUpNotifMsg = `The highest bidder for "${productTitle}" failed to complete payment. As the next highest bidder, you can now purchase this item for your bid of ₹${runnerUpAmount}. You have 24 hours to complete your payment!`;
          
          await query(`
            INSERT INTO notifications (user_id, title, message)
            VALUES ($1, $2, $3)
          `, [runnerUpId, runnerUpNotifTitle, runnerUpNotifMsg]);

          console.log(`Runner up ${runnerUpId} promoted with order ${newOrderId}`);
        } else {
          console.log(`No other bids for auction ${order.auction_id}. Closed.`);
        }

        await query('COMMIT');
      } catch (err) {
        await query('ROLLBACK');
        console.error('Failed to process cancellation and penalty for order:', order.order_id, err);
      }
    }
  } catch (error) {
    console.error('Error in checkUnpaidAuctions:', error);
  }
};
