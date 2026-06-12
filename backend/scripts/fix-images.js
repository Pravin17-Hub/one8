import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

const categoryToKeyword = {
  'Electronics': 'electronics,gadget',
  'Fashion': 'fashion,clothing',
  'Home & Kitchen': 'kitchen,home',
  'Beauty & Personal Care': 'beauty,cosmetics',
  'Groceries': 'grocery,food',
  'Books & Stationery': 'books,stationery',
  'Sports & Fitness': 'sports,fitness',
  'Automotive': 'car,automotive',
  'Toys & Baby Products': 'toy,baby',
  'Gaming': 'gaming,console',
  'Health & Medical': 'health,medical',
  'Pet Supplies': 'pet,dog,cat',
  'Jewelry & Accessories': 'jewelry,watch',
  'Office Supplies': 'office,desk',
  'Digital Products': 'software,computer'
};

async function fixImages() {
  console.log('Connecting to database...');
  
  // Get all products with their categories
  const res = await pool.query(`
    SELECT p.id as product_id, c.name as category_name 
    FROM products p
    JOIN product_categories pc ON pc.product_id = p.id
    JOIN categories c ON c.id = pc.category_id
  `);
  
  console.log(`Found ${res.rows.length} products. Updating images...`);

  let count = 0;
  for (const row of res.rows) {
    const keyword = categoryToKeyword[row.category_name] || 'product';
    const lockId = Math.floor(Math.random() * 1000) + 1;
    const newImageUrl = `https://loremflickr.com/800/800/${keyword}?lock=${lockId}`;
    
    await pool.query(
      `UPDATE product_images SET image_url = $1 WHERE product_id = $2`,
      [newImageUrl, row.product_id]
    );
    count++;
  }

  console.log(`Successfully updated ${count} images with realistic category-based photos!`);
  await pool.end();
}

fixImages().catch((err) => {
  console.error('Failed to fix images:', err);
  process.exit(1);
});
