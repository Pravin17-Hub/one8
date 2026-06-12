import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup dotenv before loading db config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';
import { faker } from '@faker-js/faker';

const CATEGORIES = [
  { name: 'Electronics & Gadgets', keywords: ['electronics', 'gadget', 'tech'] },
  { name: 'Fashion & Clothing', keywords: ['fashion', 'clothing', 'apparel'] },
  { name: 'Groceries & Food', keywords: ['grocery', 'food', 'market'] },
  { name: 'Sports & Fitness', keywords: ['sports', 'fitness', 'workout'] },
  { name: 'Home & Kitchen', keywords: ['home', 'kitchen', 'furniture'] },
  { name: 'Health & Beauty', keywords: ['beauty', 'cosmetics', 'health'] },
  { name: 'Toys & Games', keywords: ['toy', 'game', 'play'] }
];

async function seedRealProducts() {
  console.log('Connecting to database...');
  
  // 1. Clear existing catalog data
  console.log('Clearing existing products, images, and categories...');
  await pool.query('TRUNCATE TABLE products, product_images, product_categories, categories CASCADE');

  // 2. Insert Categories
  console.log('Inserting real categories...');
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const res = await pool.query(
      `INSERT INTO categories (name) VALUES ($1) RETURNING id`,
      [cat.name]
    );
    categoryMap[cat.name] = { id: res.rows[0].id, keywords: cat.keywords };
  }

  // 3. Ensure Seller exists
  const sellerResult = await pool.query("SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') LIMIT 1");
  let sellerId = sellerResult.rows[0]?.id;
  if (!sellerId) {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['megastore@one8.local', 'dummyhash123', 'Mega', 'Store', 'SELLER']
    );
    sellerId = res.rows[0].id;
  }

  // Ensure Store exists
  let storeId = (await pool.query('SELECT id FROM stores WHERE owner_id = $1 LIMIT 1', [sellerId])).rows[0]?.id;
  if (!storeId) {
    const store = await pool.query(
      `INSERT INTO stores (owner_id, name, description) VALUES ($1, 'One8 Premium Marketplace', 'Curated selection of high-quality goods') RETURNING id`,
      [sellerId]
    );
    storeId = store.rows[0].id;
  }

  const TOTAL_PER_CATEGORY = 30; 
  console.log(`Seeding ${TOTAL_PER_CATEGORY} products per category...`);

  for (const catName of Object.keys(categoryMap)) {
    const catId = categoryMap[catName].id;
    const keywords = categoryMap[catName].keywords;
    
    const values = [];
    const queryParams = [];
    const productsInBatch = [];

    for (let i = 0; i < TOTAL_PER_CATEGORY; i++) {
      let title = '';
      if (catName === 'Electronics & Gadgets') {
        title = faker.helpers.arrayElement(['Pro Wireless Earbuds', '4K Ultra HD Smart TV', 'Gaming Mechanical Keyboard', 'Smartphone 15 Pro', 'Noise Cancelling Headphones', 'Smartwatch Series X', 'Portable Power Bank 20000mAh', 'Bluetooth Speaker Water Resistant', 'Ultra-Slim Laptop 14"', 'Drone with 4K Camera']) + ' ' + faker.string.alphanumeric(3).toUpperCase();
      } else if (catName === 'Fashion & Clothing') {
        title = faker.helpers.arrayElement(["Men's Casual T-Shirt", "Women's Summer Dress", 'Classic Denim Jacket', 'Athletic Running Shoes', 'Designer Leather Bag', 'Unisex Aviator Sunglasses', 'Cozy Winter Beanie', 'Formal Silk Tie', 'Vintage Graphic Tee', 'Slim Fit Jeans']);
      } else if (catName === 'Groceries & Food') {
        title = faker.helpers.arrayElement(['Organic Avocado (Pack of 4)', 'Artisan Roasted Coffee Beans', 'Extra Virgin Olive Oil 500ml', 'Whole Wheat Sourdough Bread', 'Premium Dark Chocolate Bar', 'Organic Honey Jar', 'Fresh Atlantic Salmon Fillet', 'Free Range Eggs (Dozen)', 'Himalayan Pink Salt', 'Almond Milk 1L']);
      } else if (catName === 'Sports & Fitness') {
        title = faker.helpers.arrayElement(['Yoga Mat with Alignment Lines', 'Dumbbell Set 20kg', 'Resistance Bands (Pack of 5)', 'Protein Powder Whey Isolate', 'Jump Rope with Counter', 'Foam Roller for Muscle Massage', 'Bicycle Helmet', 'Tennis Racket Pro', 'Soccer Ball Size 5', 'Gym Duffle Bag']);
      } else if (catName === 'Home & Kitchen') {
        title = faker.helpers.arrayElement(['Non-Stick Frying Pan Set', 'Scented Soy Candle', 'Memory Foam Pillow', 'Ceramic Coffee Mug Set', 'Robot Vacuum Cleaner', 'Bamboo Cutting Board', 'Luxury Bath Towel Set', 'Minimalist Wall Clock', 'Stainless Steel Water Bottle', 'Air Purifier HEPA']);
      } else if (catName === 'Health & Beauty') {
        title = faker.helpers.arrayElement(['Hydrating Face Serum', 'Organic Lip Balm', 'SPF 50 Sunscreen Lotion', 'Vitamin C Supplements', 'Electric Toothbrush', 'Aromatherapy Essential Oils', 'Exfoliating Body Scrub', 'Matte Finish Lipstick', "Men's Grooming Kit", 'Aloe Vera Gel']);
      } else if (catName === 'Toys & Games') {
        title = faker.helpers.arrayElement(['Building Blocks 1000pc', 'Remote Control Car', 'Board Game Classic Edition', 'Plush Teddy Bear', 'Educational Puzzle Set', 'Action Figure Collectible', 'Water Gun Super Shooter', 'Dollhouse Miniature', 'Magic Trick Kit', 'Science Experiment Set']);
      }

      const description = faker.commerce.productDescription() + '\n\nFeatures:\n- High quality\n- Durable materials\n- Guaranteed satisfaction';
      const price = faker.commerce.price({ min: 5, max: 800, dec: 2 });
      const stock = faker.number.int({ min: 10, max: 200 });
      const score = faker.number.int({ min: 75, max: 99 });
      
      const offset = i * 6;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 'ACTIVE', $${offset + 6})`);
      queryParams.push(storeId, title, description, price, stock, score);
      
      // Store keyword for image mapping later
      productsInBatch.push(faker.helpers.arrayElement(keywords));
    }

    const insertQuery = `
      INSERT INTO products (store_id, title, description, price, stock_quantity, status, ai_match_score)
      VALUES ${values.join(', ')}
      RETURNING id
    `;
    const result = await pool.query(insertQuery, queryParams);
    
    // Insert Images and map categories
    const imageValues = [];
    const imageQueryParams = [];
    let imageParamOffset = 0;
    
    for (let pIndex = 0; pIndex < result.rows.length; pIndex++) {
      const productId = result.rows[pIndex].id;
      const keyword = productsInBatch[pIndex];
      // Using loremflickr to get category-specific images (e.g., https://loremflickr.com/600/600/electronics?lock=5)
      // The lock param ensures the image is stable.
      const lockId = faker.number.int({ min: 1, max: 1000 });
      const imageUrl = `https://loremflickr.com/800/800/${keyword}?lock=${lockId}`;
      
      imageValues.push(`($${imageParamOffset + 1}, $${imageParamOffset + 2}, true)`);
      imageQueryParams.push(productId, imageUrl);
      imageParamOffset += 2;
      
      // Link product to category
      await pool.query(
        `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)`,
        [productId, catId]
      );
    }
    
    const insertImagesQuery = `
      INSERT INTO product_images (product_id, image_url, is_primary)
      VALUES ${imageValues.join(', ')}
    `;
    await pool.query(insertImagesQuery, imageQueryParams);
    
    console.log(`Seeded category: ${catName} (${TOTAL_PER_CATEGORY} items)`);
  }

  await pool.end();
  console.log(`Successfully completed seeding highly realistic catalog!`);
}

seedRealProducts().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
