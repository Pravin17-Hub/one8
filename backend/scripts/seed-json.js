import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

async function seedJson() {
  console.log('Connecting to database...');
  const data = JSON.parse(fs.readFileSync(resolve(__dirname, 'dummy-products.json'), 'utf-8'));
  const products = data.products;

  // Get a default store_id
  let storeRes = await pool.query('SELECT id FROM stores LIMIT 1');
  if (storeRes.rows.length === 0) {
    const userRes = await pool.query('SELECT id FROM users LIMIT 1');
    storeRes = await pool.query(
      'INSERT INTO stores (seller_id, name, description) VALUES ($1, $2, $3) RETURNING id',
      [userRes.rows[0].id, 'Default Store', 'Store for dummy products']
    );
  }
  const storeId = storeRes.rows[0].id;

  for (const product of products) {
    // Upsert Category
    // Capitalize category name (e.g. "beauty" -> "Beauty")
    const catNameRaw = product.category;
    const catName = catNameRaw.charAt(0).toUpperCase() + catNameRaw.slice(1);
    
    let catRes = await pool.query('SELECT id FROM categories WHERE name = $1', [catName]);
    if (catRes.rows.length === 0) {
      catRes = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [catName]);
    }
    const categoryId = catRes.rows[0].id;

    // Insert Product
    const prodRes = await pool.query(
      `INSERT INTO products (store_id, title, description, price, stock_quantity)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [storeId, product.title, product.description, product.price, product.stock]
    );
    const productId = prodRes.rows[0].id;

    // Link Category
    await pool.query(
      `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)`,
      [productId, categoryId]
    );

    // Insert Images
    // First, insert thumbnail as primary
    await pool.query(
      `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)`,
      [productId, product.thumbnail, true]
    );

    // Insert other images
    for (const imgUrl of product.images) {
      // Don't insert if it's the exact same URL as the thumbnail
      if (imgUrl !== product.thumbnail) {
        await pool.query(
          `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)`,
          [productId, imgUrl, false]
        );
      }
    }
  }

  console.log(`Successfully seeded ${products.length} products!`);
  await pool.end();
}

seedJson().catch(err => {
  console.error('Error seeding JSON:', err);
  process.exit(1);
});
