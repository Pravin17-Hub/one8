import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '002_group_buy_schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Group Buy schema migration successful.');
    
    // Seed some mock data to help scaffold the UI quickly
    // 1. Get an existing active product
    const productRes = await pool.query("SELECT id, price FROM products WHERE status = 'ACTIVE' LIMIT 1");
    if (productRes.rows.length > 0) {
      const product = productRes.rows[0];
      const discountPrice = product.price * 0.7; // 30% off
      
      // Expire in 48 hours
      const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      
      // Create active session
      await pool.query(`
        INSERT INTO group_buy_sessions (product_id, target_quantity, current_quantity, discount_price, expires_at)
        VALUES ($1, 50, 15, $2, $3)
      `, [product.id, discountPrice, expiresAt]);
      
      console.log('Mock Group Buy session seeded.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
};

runMigration();
