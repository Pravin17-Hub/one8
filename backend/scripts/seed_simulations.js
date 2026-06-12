import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting simulation seeding...');
    await client.query('BEGIN');

    // 1. Get or create a store to associate products with
    const sellerResult = await client.query("SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') LIMIT 1");
    let sellerId = sellerResult.rows[0]?.id;
    if (!sellerId) {
      // Create a mock seller if none exists
      const insertSeller = await client.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES ('Simulation', 'Seller', 'seller@simulation.one8', 'mock_password_hash', 'SELLER')
        RETURNING id
      `);
      sellerId = insertSeller.rows[0].id;
    }

    let storeResult = await client.query('SELECT id FROM stores WHERE owner_id = $1 LIMIT 1', [sellerId]);
    let storeId = storeResult.rows[0]?.id;
    if (!storeId) {
      const insertStore = await client.query(`
        INSERT INTO stores (owner_id, name, description)
        VALUES ($1, 'Simulation Marketplace Store', 'Simulated products for auctions and group buys')
        RETURNING id
      `, [sellerId]);
      storeId = insertStore.rows[0].id;
    }

    // 2. Fetch Category IDs for Electronics and Gaming
    const catResult = await client.query("SELECT id, name FROM categories WHERE name IN ('Electronics', 'Gaming')");
    let categoriesMap = {};
    catResult.rows.forEach(row => {
      categoriesMap[row.name] = row.id;
    });
    const electronicsCatId = categoriesMap['Electronics'] || 1;
    const gamingCatId = categoriesMap['Gaming'] || 2;

    // 3. Create mock users for bids/participants (if they don't exist)
    const mockUsers = [
      { first_name: 'Rahul', last_name: 'Sharma', email: 'rahul@simulation.one8' },
      { first_name: 'Priya', last_name: 'Patel', email: 'priya@simulation.one8' },
      { first_name: 'Amit', last_name: 'Verma', email: 'amit@simulation.one8' },
      { first_name: 'Sneha', last_name: 'Reddy', email: 'sneha@simulation.one8' },
      { first_name: 'Vikram', last_name: 'Singh', email: 'vikram@simulation.one8' },
      { first_name: 'Ananya', last_name: 'Rao', email: 'ananya@simulation.one8' },
      { first_name: 'Karan', last_name: 'Mehta', email: 'karan@simulation.one8' }
    ];

    const seededUserIds = [];
    for (const u of mockUsers) {
      const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (userCheck.rows.length > 0) {
        seededUserIds.push(userCheck.rows[0].id);
      } else {
        const insertUser = await client.query(`
          INSERT INTO users (first_name, last_name, email, password_hash, role)
          VALUES ($1, $2, $3, 'mock_password_hash', 'CUSTOMER')
          RETURNING id
        `, [u.first_name, u.last_name, u.email]);
        seededUserIds.push(insertUser.rows[0].id);
      }
    }

    // Helper to get user ID by name
    const getUserIdx = (name) => {
      if (name === 'Rahul') return seededUserIds[0];
      if (name === 'Priya') return seededUserIds[1];
      if (name === 'Amit') return seededUserIds[2];
      if (name === 'Sneha') return seededUserIds[3];
      if (name === 'Vikram') return seededUserIds[4];
      if (name === 'Ananya') return seededUserIds[5];
      if (name === 'Karan') return seededUserIds[6];
      return seededUserIds[0];
    };

    // 4. Clean up existing simulation auctions and group buys
    // To make this idempotent, we can query products starting with '[Simulated]' or delete all auctions and group buys first
    // Since this is a test/demo database, clearing auctions, auction_bids, group_buys is very clean.
    console.log('Clearing existing auctions and group buy sessions...');
    await client.query('DELETE FROM auction_bids');
    await client.query('DELETE FROM auctions');
    await client.query('DELETE FROM group_buy_participants');
    await client.query('DELETE FROM group_buy_sessions');
    
    // Also delete product images and products created for simulation
    const oldSimProducts = await client.query("SELECT id FROM products WHERE title LIKE '[Simulated]%'");
    const simProductIds = oldSimProducts.rows.map(r => r.id);
    if (simProductIds.length > 0) {
      await client.query("DELETE FROM product_images WHERE product_id = ANY($1)", [simProductIds]);
      await client.query("DELETE FROM product_categories WHERE product_id = ANY($1)", [simProductIds]);
      await client.query("DELETE FROM products WHERE id = ANY($1)", [simProductIds]);
    }

    console.log('Seeding simulated auctions...');

    // 5. Seed 6 Auctions
    const auctionData = [
      {
        title: '[Simulated] Sony PlayStation 5 Pro',
        description: 'Experience the next level of gaming with the PlayStation 5 Pro. Features advanced ray tracing, 4K gaming, and ultra-high-speed SSD.',
        price: 52000.00, // current bid/price
        starting_price: 45000.00,
        ends_in_hours: 2.5,
        category_id: gamingCatId,
        image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
        bids: [
          { bidder: 'Sneha', amount: 46000.00, minutes_ago: 90 },
          { bidder: 'Amit', amount: 48000.00, minutes_ago: 60 },
          { bidder: 'Priya', amount: 50000.00, minutes_ago: 45 },
          { bidder: 'Rahul', amount: 52000.00, minutes_ago: 20 }
        ]
      },
      {
        title: '[Simulated] MacBook Pro 16 M3 Max',
        description: 'The most advanced MacBook Pro yet. M3 Max chip, 36GB Unified Memory, 1TB SSD. Liquid Retina XDR display.',
        price: 195000.00,
        starting_price: 180000.00,
        ends_in_hours: 6.5,
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        bids: [
          { bidder: 'Priya', amount: 185000.00, minutes_ago: 60 },
          { bidder: 'Vikram', amount: 190000.00, minutes_ago: 30 },
          { bidder: 'Sneha', amount: 195000.00, minutes_ago: 10 }
        ]
      },
      {
        title: '[Simulated] iPhone 15 Pro Max 512GB',
        description: 'Titanium design, A17 Pro chip, customisable Action button, and the most powerful iPhone camera system ever.',
        price: 118000.00,
        starting_price: 110000.00,
        ends_in_hours: 28, // 1 day 4 hours
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
        bids: [
          { bidder: 'Sneha', amount: 112000.00, minutes_ago: 240 },
          { bidder: 'Rahul', amount: 115000.00, minutes_ago: 180 },
          { bidder: 'Amit', amount: 118000.00, minutes_ago: 90 }
        ]
      },
      {
        title: '[Simulated] RTX 4090 Founders Edition',
        description: 'The ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics.',
        price: 162000.00,
        starting_price: 150000.00,
        ends_in_hours: 0.75, // 45 mins
        category_id: gamingCatId,
        image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
        bids: [
          { bidder: 'Priya', amount: 152000.00, minutes_ago: 30 },
          { bidder: 'Rahul', amount: 155000.00, minutes_ago: 20 },
          { bidder: 'Amit', amount: 158000.00, minutes_ago: 12 },
          { bidder: 'Vikram', amount: 162000.00, minutes_ago: 5 }
        ]
      },
      {
        title: '[Simulated] Sony WH-1000XM5 ANC Headphones',
        description: 'Industry leading noise-canceling headphones with auto-NC optimizer, crystal clear hands-free calling.',
        price: 24500.00,
        starting_price: 22000.00,
        ends_in_hours: 14,
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        bids: [
          { bidder: 'Amit', amount: 23000.00, minutes_ago: 360 },
          { bidder: 'Sneha', amount: 23500.00, minutes_ago: 240 },
          { bidder: 'Priya', amount: 24500.00, minutes_ago: 120 }
        ]
      },
      {
        title: '[Simulated] iPad Pro 12.9-inch M2',
        description: 'Astonishing performance. Incredibly advanced displays. Superfast wireless connectivity. Next-generation Apple Pencil features.',
        price: 90000.00,
        starting_price: 90000.00,
        ends_in_hours: 56, // 2 days 8 hours
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        bids: [] // no bids yet
      }
    ];

    for (const a of auctionData) {
      // Create product first
      const productRes = await client.query(`
        INSERT INTO products (store_id, title, description, price, stock_quantity, status, rating, ai_match_score)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 4.5, 95)
        RETURNING id
      `, [storeId, a.title, a.description, a.price, 1]);
      const productId = productRes.rows[0].id;

      // Category map
      await client.query(`
        INSERT INTO product_categories (product_id, category_id)
        VALUES ($1, $2)
      `, [productId, a.category_id]);

      // Image map
      await client.query(`
        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES ($1, $2, true)
      `, [productId, a.image_url]);

      // Create Auction
      const endsAt = new Date(Date.now() + a.ends_in_hours * 60 * 60 * 1000);
      const highestBidderId = a.bids.length > 0 ? getUserIdx(a.bids[a.bids.length - 1].bidder) : null;
      
      const auctionRes = await client.query(`
        INSERT INTO auctions (product_id, starting_price, current_highest_bid, highest_bidder_id, ends_at, status)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
        RETURNING id
      `, [productId, a.starting_price, a.price, highestBidderId, endsAt]);
      const auctionId = auctionRes.rows[0].id;

      // Seed Bids
      for (const bid of a.bids) {
        const bidderId = getUserIdx(bid.bidder);
        const bidTime = new Date(Date.now() - bid.minutes_ago * 60 * 1000);
        await client.query(`
          INSERT INTO auction_bids (auction_id, user_id, bid_amount, created_at)
          VALUES ($1, $2, $3, $4)
        `, [auctionId, bidderId, bid.amount, bidTime]);
      }
    }

    console.log('Seeding simulated group buy sessions...');

    // 6. Seed 6 Group Buys
    const groupBuyData = [
      {
        title: '[Simulated] Keychron K2 Mechanical Keyboard',
        description: 'A 75% layout wireless mechanical keyboard with hot-swappable options, RGB backlighting, and Gateron switches.',
        original_price: 8999.00,
        discount_price: 6299.00,
        target_quantity: 10,
        current_quantity: 7,
        expires_in_hours: 18,
        category_id: gamingCatId,
        image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
        participants: ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Karan']
      },
      {
        title: '[Simulated] Logitech MX Master 3S Mouse',
        description: 'An iconic ergonomic mouse remastered. Quiet clicks, electromagnetic scroll wheel, 8K DPI sensor.',
        original_price: 10995.00,
        discount_price: 7695.00,
        target_quantity: 8,
        current_quantity: 3,
        expires_in_hours: 36,
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400',
        participants: ['Sneha', 'Priya', 'Vikram']
      },
      {
        title: '[Simulated] Samsung T7 Portable SSD 2TB',
        description: 'Superfast external storage with read speeds up to 1050MB/s. Shock-resistant design.',
        original_price: 15999.00,
        discount_price: 11999.00,
        target_quantity: 15,
        current_quantity: 12,
        expires_in_hours: 3.5,
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1609703409074-8968b8ec66d2?w=400',
        participants: ['Rahul', 'Sneha', 'Amit', 'Vikram', 'Priya', 'Ananya', 'Karan'] // Seeding some, can seed all 12
      },
      {
        title: '[Simulated] Anker 737 Power Bank (PowerCore 24K)',
        description: 'Ultra-high capacity power bank with 140W fast charging. Features a smart digital display.',
        original_price: 12999.00,
        discount_price: 8999.00,
        target_quantity: 20,
        current_quantity: 5,
        expires_in_hours: 72,
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400',
        participants: ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram']
      },
      {
        title: '[Simulated] Xiaomi Smart Projector 2',
        description: 'Portable projector supporting up to 120-inch screen size. Full HD resolution, auto-focus, and Android TV.',
        original_price: 39999.00,
        discount_price: 29999.00,
        target_quantity: 5,
        current_quantity: 4,
        expires_in_hours: 9,
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400',
        participants: ['Rahul', 'Priya', 'Sneha', 'Vikram']
      },
      {
        title: '[Simulated] DJI Osmo Pocket 3',
        description: 'Pocket-sized gimbal camera featuring a powerful 1-inch CMOS sensor. 4K/120fps recording, active track 6.0.',
        original_price: 45900.00,
        discount_price: 36900.00,
        target_quantity: 12,
        current_quantity: 1,
        expires_in_hours: 120,
        category_id: electronicsCatId,
        image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        participants: ['Rahul']
      }
    ];

    for (const g of groupBuyData) {
      // Create product first
      const productRes = await client.query(`
        INSERT INTO products (store_id, title, description, price, stock_quantity, status, rating, ai_match_score)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 4.7, 92)
        RETURNING id
      `, [storeId, g.title, g.description, g.original_price, 50]);
      const productId = productRes.rows[0].id;

      // Category map
      await client.query(`
        INSERT INTO product_categories (product_id, category_id)
        VALUES ($1, $2)
      `, [productId, g.category_id]);

      // Image map
      await client.query(`
        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES ($1, $2, true)
      `, [productId, g.image_url]);

      // Create Group Buy Session
      const expiresAt = new Date(Date.now() + g.expires_in_hours * 60 * 60 * 1000);
      
      const sessionRes = await client.query(`
        INSERT INTO group_buy_sessions (product_id, target_quantity, current_quantity, discount_price, expires_at, status)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
        RETURNING id
      `, [productId, g.target_quantity, g.current_quantity, g.discount_price, expiresAt]);
      const sessionId = sessionRes.rows[0].id;

      // Seed Participants
      for (const pName of g.participants) {
        const participantId = getUserIdx(pName);
        await client.query(`
          INSERT INTO group_buy_participants (session_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [sessionId, participantId]);
      }
    }

    await client.query('COMMIT');
    console.log('Simulation seeding complete! Successfully seeded 6 auctions and 6 group buys.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding simulation failed', error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
