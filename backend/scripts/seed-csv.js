import fs from 'fs';
import csv from 'csv-parser';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

async function processRow(row, storeId, categoryMap) {
  const { Category, ProductName, Price_INR, Description, ImageURL, Stock, Rating } = row;
  
  // 1. Resolve Category
  let categoryId = categoryMap[Category];
  if (!categoryId) {
    const res = await pool.query(`INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id`, [Category]);
    if (res.rows.length > 0) {
      categoryId = res.rows[0].id;
    } else {
      const existing = await pool.query(`SELECT id FROM categories WHERE name = $1`, [Category]);
      categoryId = existing.rows[0].id;
    }
    categoryMap[Category] = categoryId;
  }
  
  // 2. Insert Product
  // Convert INR to USD approximately (dividing by 83) if you want, but since UI shows $ maybe we should keep the price as is or divide. We'll divide by 83 to make it look realistic in USD, OR just insert the raw value. The user didn't ask to convert, but the CSV says Price_INR. We'll just insert the raw value.
  const price = parseFloat(Price_INR);
  const stock = parseInt(Stock, 10);
  const aiScore = Math.floor(Math.random() * 20) + 80; // random high score 80-99

  const productRes = await pool.query(
    `INSERT INTO products (store_id, title, description, price, stock_quantity, status, ai_match_score)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6) RETURNING id`,
    [storeId, ProductName, Description, price, stock, aiScore]
  );
  
  const productId = productRes.rows[0].id;

  // 3. Map Category
  await pool.query(
    `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [productId, categoryId]
  );
  
  // 4. Insert Image
  await pool.query(
    `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)`,
    [productId, ImageURL]
  );
}

async function seedFromCsv() {
  console.log('Connecting to database...');
  
  // Wipe old catalog
  console.log('Clearing existing products, images, and categories...');
  await pool.query('TRUNCATE TABLE products, product_images, product_categories, categories CASCADE');

  // Setup Store
  const sellerResult = await pool.query("SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') LIMIT 1");
  let sellerId = sellerResult.rows[0]?.id;
  if (!sellerId) {
    const res = await pool.query(`INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`, ['megastore@one8.local', 'dummyhash123', 'Mega', 'Store', 'SELLER']);
    sellerId = res.rows[0].id;
  }
  let storeId = (await pool.query('SELECT id FROM stores WHERE owner_id = $1 LIMIT 1', [sellerId])).rows[0]?.id;
  if (!storeId) {
    const store = await pool.query(`INSERT INTO stores (owner_id, name, description) VALUES ($1, 'One8 Premium Marketplace', 'Curated selection') RETURNING id`, [sellerId]);
    storeId = store.rows[0].id;
  }

  const categoryMap = {};
  const results = [];
  
  console.log('Reading CSV file...');
  const csvFilePath = resolve(__dirname, '../../One8_300_Realistic_Products.csv');
  
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Found ${results.length} rows in CSV.`);
      
      let count = 0;
      for (const row of results) {
        if (!row.ProductName) continue; // Skip empty rows
        try {
          await processRow(row, storeId, categoryMap);
          count++;
          if (count % 50 === 0) console.log(`Processed ${count} products...`);
        } catch (err) {
          console.error(`Failed to process row: ${row.ProductName}`, err.message);
        }
      }
      
      console.log(`Successfully seeded ${count} products from CSV!`);
      await pool.end();
    });
}

seedFromCsv().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
