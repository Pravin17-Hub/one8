import { query } from '../config/db.js';

export const getActiveAuctions = async (req, res) => {
  try {
    const result = await query(`
      SELECT a.id, a.starting_price, a.current_highest_bid, a.ends_at, a.status,
             p.title, p.description, p.id as product_id,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      WHERE a.status = 'ACTIVE' AND a.ends_at > CURRENT_TIMESTAMP
      ORDER BY a.ends_at ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch auctions', error);
    res.status(500).json({ error: 'Failed to fetch active auctions' });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT a.id, a.starting_price, a.current_highest_bid, a.ends_at, a.status,
             p.title, p.description, p.id as product_id,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch auction details', error);
    res.status(500).json({ error: 'Failed to fetch auction details' });
  }
};

export const getAuctionBids = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT ab.id, ab.bid_amount, ab.created_at, u.first_name, u.last_name
      FROM auction_bids ab
      JOIN users u ON ab.user_id = u.id
      WHERE ab.auction_id = $1
      ORDER BY ab.bid_amount DESC
      LIMIT 50
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch bids', error);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { bidAmount } = req.body;
    const userId = req.user.id;

    // 1. Check if auction is valid
    const auctionRes = await query('SELECT * FROM auctions WHERE id = $1 AND status = $2 AND ends_at > CURRENT_TIMESTAMP', [id, 'ACTIVE']);
    if (auctionRes.rows.length === 0) return res.status(404).json({ error: 'Auction not found or ended' });
    
    const auction = auctionRes.rows[0];

    // 2. Validate bid amount
    if (parseFloat(bidAmount) <= parseFloat(auction.current_highest_bid)) {
      return res.status(400).json({ error: 'Bid must be higher than current highest bid' });
    }

    // 3. Record bid and update auction in a transaction
    await query('BEGIN');
    
    await query('INSERT INTO auction_bids (auction_id, user_id, bid_amount) VALUES ($1, $2, $3)', [id, userId, bidAmount]);
    await query('UPDATE auctions SET current_highest_bid = $1, highest_bidder_id = $2 WHERE id = $3', [bidAmount, userId, id]);
    
    await query('COMMIT');

    res.json({ message: 'Bid placed successfully!', new_highest_bid: bidAmount });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Failed to place bid', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
};
