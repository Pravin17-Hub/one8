import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup dotenv before loading db config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';
import { faker } from '@faker-js/faker';

async function seed() {
  console.log('Connecting to database to seed 1000 products...');
  
  // Ensure we have a seller
  const sellerResult = await pool.query(
    "SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') LIMIT 1"
  );
  let sellerId = sellerResult.rows[0]?.id;

  if (!sellerId) {
    console.log('No seller found. Creating a generic seller...');
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['megastore@one8.local', 'dummyhash123', 'Mega', 'Store', 'SELLER']
    );
    sellerId = result.rows[0].id;
  }

  // Ensure we have a store
  let storeId = (
    await pool.query('SELECT id FROM stores WHERE owner_id = $1 LIMIT 1', [sellerId])
  ).rows[0]?.id;

  if (!storeId) {
    const store = await pool.query(
      `INSERT INTO stores (owner_id, name, description)
       VALUES ($1, 'Mega Store', 'Massive collection of awesome products')
       RETURNING id`,
      [sellerId]
    );
    storeId = store.rows[0].id;
  }

  const BATCH_SIZE = 100;
  const TOTAL_PRODUCTS = 1000;
  
  console.log(`Starting to seed ${TOTAL_PRODUCTS} products into Store ID ${storeId}...`);

  for (let batch = 0; batch < TOTAL_PRODUCTS / BATCH_SIZE; batch++) {
    const values = [];
    const queryParams = [];
    
    // Arrays for image generation
    const productsInBatch = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const title = faker.commerce.productName();
      const description = faker.commerce.productDescription() + '\n\n' + faker.lorem.paragraphs(2);
      const price = faker.commerce.price({ min: 10, max: 2000, dec: 2 });
      const stock = faker.number.int({ min: 0, max: 1000 });
      const score = faker.number.int({ min: 60, max: 100 });
      
      const offset = i * 6;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 'ACTIVE', $${offset + 6})`);
      queryParams.push(storeId, title, description, price, stock, score);
      
      productsInBatch.push(title);
    }

    // Insert Products
    const insertQuery = `
      INSERT INTO products (store_id, title, description, price, stock_quantity, status, ai_match_score)
      VALUES ${values.join(', ')}
      RETURNING id
    `;
    
    const result = await pool.query(insertQuery, queryParams);
    
    // Insert Images
    const imageValues = [];
    const imageQueryParams = [];
    let imageParamOffset = 0;
    
    for (let pIndex = 0; pIndex < result.rows.length; pIndex++) {
      const productId = result.rows[pIndex].id;
      // Using deterministic seed for pictures so they remain stable, picking random beautiful stock photos via picsum
      const imageUrl = `https://picsum.photos/seed/product_${productId}/800/800`;
      
      imageValues.push(`($${imageParamOffset + 1}, $${imageParamOffset + 2}, true)`);
      imageQueryParams.push(productId, imageUrl);
      imageParamOffset += 2;
    }
    
    const insertImagesQuery = `
      INSERT INTO product_images (product_id, image_url, is_primary)
      VALUES ${imageValues.join(', ')}
    `;
    
    await pool.query(insertImagesQuery, imageQueryParams);
    
    console.log(`Seeded batch ${batch + 1}/${TOTAL_PRODUCTS / BATCH_SIZE} (${(batch + 1) * BATCH_SIZE} products)`);
  }

  await pool.end();
  console.log(`Successfully seeded ${TOTAL_PRODUCTS} products!`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
