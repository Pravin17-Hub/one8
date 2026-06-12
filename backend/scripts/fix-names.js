import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { faker } from '@faker-js/faker';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

async function fixNames() {
  console.log('Connecting to database...');
  
  // Get all products that have dummy names like "Digital Product 1", "Grocery Item 1", etc.
  const res = await pool.query(`
    SELECT p.id as product_id, p.title, c.name as category_name 
    FROM products p
    JOIN product_categories pc ON pc.product_id = p.id
    JOIN categories c ON c.id = pc.category_id
    WHERE p.title ~* '(Product |Item )\\d+'
  `);
  
  console.log(`Found ${res.rows.length} products with dummy names. Updating with real names...`);

  let count = 0;
  for (const row of res.rows) {
    let newTitle = '';
    const catName = row.category_name;

    if (catName === 'Home & Kitchen') {
        newTitle = faker.helpers.arrayElement(['Non-Stick Frying Pan Set', 'Scented Soy Candle', 'Memory Foam Pillow', 'Ceramic Coffee Mug Set', 'Robot Vacuum Cleaner', 'Bamboo Cutting Board', 'Luxury Bath Towel Set', 'Minimalist Wall Clock', 'Stainless Steel Water Bottle', 'Air Purifier HEPA', 'Premium Chef Knife', 'Soft Microfiber Bed Sheets', 'Aromatherapy Diffuser', 'Cast Iron Skillet', 'Electric Kettle 1.7L']);
    } else if (catName === 'Beauty & Personal Care') {
        newTitle = faker.helpers.arrayElement(['Hydrating Face Serum', 'Organic Lip Balm', 'SPF 50 Sunscreen Lotion', 'Vitamin C Supplements', 'Electric Toothbrush', 'Aromatherapy Essential Oils', 'Exfoliating Body Scrub', 'Matte Finish Lipstick', "Men's Grooming Kit", 'Aloe Vera Gel', 'Charcoal Face Mask', 'Hair Repair Conditioner', 'Anti-Aging Night Cream', 'Rose Water Toner', 'Luxury Bath Bombs']);
    } else if (catName === 'Groceries') {
        newTitle = faker.helpers.arrayElement(['Organic Avocado (Pack of 4)', 'Artisan Roasted Coffee Beans', 'Extra Virgin Olive Oil 500ml', 'Whole Wheat Sourdough Bread', 'Premium Dark Chocolate Bar', 'Organic Honey Jar', 'Fresh Atlantic Salmon Fillet', 'Free Range Eggs (Dozen)', 'Himalayan Pink Salt', 'Almond Milk 1L', 'Organic Quinoa 1kg', 'Mixed Nuts Roasted', 'Green Tea Bags', 'Aged Cheddar Cheese', 'Fresh Strawberries']);
    } else if (catName === 'Books & Stationery') {
        newTitle = faker.helpers.arrayElement(['Hardcover Notebook', 'Premium Gel Pens (Pack of 5)', 'Leather Bound Journal', 'Sticky Notes Variety Pack', 'Highlighter Set', 'Desk Organizer', 'Scientific Calculator', 'Sketchbook A4', 'Fountain Pen', 'Watercolor Paint Set', 'Bestseller Fiction Novel', 'Self-Help Book', 'Cookbook Hardcover', "Children's Storybook", 'Weekly Planner']);
    } else if (catName === 'Sports & Fitness') {
        newTitle = faker.helpers.arrayElement(['Yoga Mat with Alignment Lines', 'Dumbbell Set 20kg', 'Resistance Bands (Pack of 5)', 'Protein Powder Whey Isolate', 'Jump Rope with Counter', 'Foam Roller for Muscle Massage', 'Bicycle Helmet', 'Tennis Racket Pro', 'Soccer Ball Size 5', 'Gym Duffle Bag', 'Fitness Smartwatch', 'Adjustable Kettlebell', 'Push-Up Bars', 'Pilates Ring', 'Running Belt']);
    } else if (catName === 'Automotive') {
        newTitle = faker.helpers.arrayElement(['Premium Car Wash Soap', 'Microfiber Cleaning Cloths', 'Dashboard Phone Mount', 'Car Jump Starter Power Bank', 'Tire Pressure Gauge', 'Leather Seat Conditioner', 'LED Headlight Bulbs', 'Windshield Sun Shade', 'Portable Air Compressor', 'Car Vacuum Cleaner', 'Blind Spot Mirrors', 'Floor Mats Set', 'Steering Wheel Cover', 'Wiper Blades', 'Ceramic Coating Kit']);
    } else if (catName === 'Toys & Baby Products') {
        newTitle = faker.helpers.arrayElement(['Building Blocks 1000pc', 'Remote Control Car', 'Board Game Classic Edition', 'Plush Teddy Bear', 'Educational Puzzle Set', 'Action Figure Collectible', 'Water Gun Super Shooter', 'Dollhouse Miniature', 'Magic Trick Kit', 'Science Experiment Set', 'Baby Stroller', 'Diaper Bag Backpack', 'Baby Monitor with Camera', 'Teething Toys Set', 'Baby Carrier']);
    } else if (catName === 'Gaming') {
        newTitle = faker.helpers.arrayElement(['Wireless Gaming Controller', 'Mechanical Gaming Keyboard', 'Gaming Mouse with RGB', 'Gaming Headset 7.1', 'Extended Mouse Pad', 'Console Charging Station', 'VR Headset Case', 'Gaming Monitor 144Hz', 'RGB Strip Lights', 'Gaming Chair Ergonomic', 'Retro Console Emulator', 'Webcam 1080p', 'Streaming Microphone', 'Controller Grips', 'Game Capture Card']);
    } else if (catName === 'Health & Medical') {
        newTitle = faker.helpers.arrayElement(['Digital Blood Pressure Monitor', 'Pulse Oximeter', 'First Aid Kit', 'Infrared Thermometer', 'Knee Brace Support', 'Compression Socks', 'Multivitamin Gummies', 'Omega-3 Fish Oil', 'Heating Pad', 'Massage Gun', 'Posture Corrector', 'Bandages Assorted Sizes', 'Pill Organizer', 'Medical Face Masks', 'Hand Sanitizer Gel']);
    } else if (catName === 'Pet Supplies') {
        newTitle = faker.helpers.arrayElement(['Premium Dog Food 5kg', 'Interactive Cat Toy', 'Orthopedic Dog Bed', 'Cat Tree Tower', 'Self-Cleaning Litter Box', 'Pet Grooming Brush', 'Adjustable Dog Harness', 'Retractable Leash', 'Pet Water Fountain', 'Bird Cage Accessories', 'Aquarium Filter', 'Hamster Wheel', 'Dental Chews for Dogs', 'Catnip Mouse', 'Pet Carrier Backpack']);
    } else if (catName === 'Jewelry & Accessories') {
        newTitle = faker.helpers.arrayElement(['Sterling Silver Necklace', 'Gold Plated Hoop Earrings', 'Diamond Stud Earrings', "Men's Chronograph Watch", 'Leather Wallet', 'Polarized Sunglasses', 'Silk Scarf', 'Crystal Bracelet', 'Cufflinks Set', 'Engraved Ring', 'Canvas Tote Bag', 'Crossbody Purse', 'Beanie Hat', 'Woven Belt', 'Pearl Pendant']);
    } else if (catName === 'Office Supplies') {
        newTitle = faker.helpers.arrayElement(['Ergonomic Office Chair', 'Wireless Mouse', 'Laptop Stand Aluminum', 'Desk Lamp with USB', 'Mechanical Pencil Set', 'Paper Shredder', 'Dry Erase Board', 'Filing Cabinet', 'Printer Ink Cartridges', 'Copy Paper 500 Sheets', 'Stapler Heavy Duty', 'Paper Clips Jumbo', 'Manila Folders', 'Binder Clips Set', 'Mouse Pad with Wrist Rest']);
    } else if (catName === 'Digital Products') {
        newTitle = faker.helpers.arrayElement(['Antivirus Software 1-Year', 'Video Editing Suite', 'Graphic Design Assets Bundle', 'Online Course: Web Dev', 'E-Book: Productivity Hacks', 'Cloud Storage 1TB (1Yr)', 'VPN Subscription', 'Premium Font Family', 'Website Template Pro', 'Digital Planner PDF', 'Audiobook: Business Strategy', 'Stock Video Pack', 'Music Production Samples', 'Lightroom Presets', 'Social Media Templates']);
    } else {
        newTitle = faker.commerce.productName();
    }

    // Add a unique twist to avoid identical names since we randomly pick
    newTitle = newTitle + ' ' + faker.string.alphanumeric(3).toUpperCase();

    const newDesc = faker.commerce.productDescription();

    await pool.query(
      `UPDATE products SET title = $1, description = $2 WHERE id = $3`,
      [newTitle, newDesc, row.product_id]
    );
    count++;
  }

  console.log(`Successfully updated ${count} products with highly realistic names and descriptions!`);
  await pool.end();
}

fixNames().catch((err) => {
  console.error('Failed to fix names:', err);
  process.exit(1);
});
