import { query } from '../config/db.js';

const checkAndGenAuctions = async () => {
  // Auto-complete expired auctions
  await query(`
    UPDATE auctions 
    SET status = 'COMPLETED' 
    WHERE status = 'ACTIVE' AND ends_at <= CURRENT_TIMESTAMP
  `);

  // Count active auctions
  const activeCountRes = await query(`
    SELECT COUNT(*) FROM auctions 
    WHERE status = 'ACTIVE' AND ends_at > CURRENT_TIMESTAMP
  `);
  const activeCount = parseInt(activeCountRes.rows[0].count);

  if (activeCount < 5) {
    const needToGenerate = 5 - activeCount;
    console.log(`Active auctions count is ${activeCount}, generating ${needToGenerate} new ones...`);
    
    for (let i = 0; i < needToGenerate; i++) {
      // Find a random active product that is not currently in an active auction
      const productRes = await query(`
        SELECT p.id, p.price, p.title FROM products p
        WHERE p.status = 'ACTIVE'
          AND p.id NOT IN (
            SELECT product_id FROM auctions 
            WHERE status = 'ACTIVE' AND ends_at > CURRENT_TIMESTAMP
          )
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (productRes.rows.length > 0) {
        const prod = productRes.rows[0];
        const startingPrice = Math.round(parseFloat(prod.price) * 0.7); // 30% discount start
        
        // Stagger end times: 2h, 4h, 6h, 8h, 12h, 24h randomly
        const hours = [2, 4, 6, 8, 12, 24][Math.floor(Math.random() * 6)];
        const endsAt = new Date(Date.now() + hours * 60 * 60 * 1000);

        await query(`
          INSERT INTO auctions (product_id, starting_price, current_highest_bid, ends_at, status)
          VALUES ($1, $2, $2, $3, 'ACTIVE')
        `, [prod.id, startingPrice, endsAt]);
        
        console.log(`Spawned new auction for product: ${prod.title} (ends in ${hours} hours)`);
      }
    }
  }
};

export const getActiveAuctions = async (req, res) => {
  try {
    await checkAndGenAuctions();

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

export const createAuction = async (req, res) => {
  try {
    const { product_id, starting_price, ends_at } = req.body;
    if (!product_id || !starting_price || !ends_at) {
      return res.status(400).json({ error: 'product_id, starting_price, and ends_at are required' });
    }
    const endsDate = new Date(ends_at);
    if (isNaN(endsDate.getTime()) || endsDate <= new Date()) {
      return res.status(400).json({ error: 'ends_at must be a valid future date' });
    }
    const result = await query(
      "INSERT INTO auctions (product_id, starting_price, current_highest_bid, ends_at, status) VALUES ($1, $2, $2, $3, 'ACTIVE') RETURNING *",
      [product_id, starting_price, endsDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create auction', error);
    res.status(500).json({ error: 'Failed to create auction' });
  }
};

export const completeAuction = async (req, res) => {
  try {
    const { id } = req.params;
    // Standard update status to completed
    const result = await query(
      "UPDATE auctions SET status = 'COMPLETED', ends_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to complete auction', error);
    res.status(500).json({ error: 'Failed to complete auction' });
  }
};

