import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup dotenv before loading db config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Automotive',
  'Health & Beauty',
  'Toys & Games'
];

async function seedCategories() {
  console.log('Seeding categories...');
  
  // 1. Insert categories
  const categoryIds = [];
  for (const name of CATEGORIES) {
    const res = await pool.query(
      `INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id`,
      [name]
    );
    if (res.rows.length > 0) {
      categoryIds.push(res.rows[0].id);
    } else {
      const existing = await pool.query(`SELECT id FROM categories WHERE name = $1`, [name]);
      categoryIds.push(existing.rows[0].id);
    }
  }

  // 2. Assign categories to existing products
  console.log('Assigning categories to all products...');
  
  const productsRes = await pool.query('SELECT id FROM products');
  const productIds = productsRes.rows.map(r => r.id);
  
  let inserted = 0;
  
  for (const productId of productIds) {
    // Pick 1-2 random categories for this product
    const numCategories = Math.floor(Math.random() * 2) + 1;
    const shuffled = [...categoryIds].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numCategories);
    
    for (const catId of selected) {
      await pool.query(
        `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [productId, catId]
      );
      inserted++;
    }
  }

  console.log(`Successfully mapped ${inserted} product_categories rows across ${productIds.length} products.`);
  await pool.end();
}

seedCategories().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
