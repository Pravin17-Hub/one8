import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '003_auctions_schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Auctions schema migration successful.');
    
    // Seed mock active auction
    const productRes = await pool.query("SELECT id, price FROM products WHERE status = 'ACTIVE' LIMIT 1 OFFSET 1");
    if (productRes.rows.length > 0) {
      const product = productRes.rows[0];
      const startingPrice = Math.max(1, product.price * 0.4); // Start at 40% of original price
      
      // Expire in 12 hours
      const endsAt = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
      
      await pool.query(`
        INSERT INTO auctions (product_id, starting_price, current_highest_bid, ends_at)
        VALUES ($1, $2, $3, $4)
      `, [product.id, startingPrice, startingPrice, endsAt]);
      
      console.log('Mock Auction seeded.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
};

runMigration();
