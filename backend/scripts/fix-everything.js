import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

const categoryData = {
  'Electronics': {
    images: [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'
    ],
    items: [
      { name: 'Sony Noise Cancelling Headphones', desc: 'Industry leading noise cancellation with dual noise sensor technology. Enjoy up to 30 hours of battery life.', price: 298.00 },
      { name: 'Apple MacBook Pro 14"', desc: 'Powerful M3 Pro chip, stunning Liquid Retina XDR display, and all-day battery life for professionals.', price: 1999.00 },
      { name: 'Samsung 4K Smart TV', desc: 'Experience crystal clear colors that are fine-tuned to deliver a naturally crisp and vivid picture.', price: 549.99 },
      { name: 'Logitech Wireless Mouse', desc: 'Advanced ergonomic design promotes natural hand posture and reduces wrist strain for all-day comfort.', price: 99.99 },
      { name: 'Apple iPad Air', desc: 'Supercharged by the M1 chip. Features a 10.9-inch Liquid Retina display and all-day battery life.', price: 599.00 }
    ]
  },
  'Fashion': {
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      'https://images.unsplash.com/photo-1434389678232-0408d927a44f?w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
    ],
    items: [
      { name: 'Classic Denim Jacket', desc: 'A timeless denim jacket with a relaxed fit, perfect for layering in any season.', price: 75.00 },
      { name: 'Cotton Crewneck T-Shirt', desc: 'Ultra-soft, breathable 100% organic cotton t-shirt for everyday wear.', price: 25.00 },
      { name: 'Men\'s Tailored Wool Suit', desc: 'Premium wool blend suit tailored for a sharp, modern silhouette.', price: 399.00 },
      { name: 'Women\'s Floral Maxi Dress', desc: 'Elegant and flowing floral dress, ideal for summer weddings and garden parties.', price: 89.99 },
      { name: 'Genuine Leather Ankle Boots', desc: 'Durable and stylish leather boots featuring a comfortable stacked heel.', price: 145.00 }
    ]
  },
  'Home & Kitchen': {
    images: [
      'https://images.unsplash.com/photo-1556910103-1c02745a872f?w=800&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28ce8fdb086?w=800&q=80'
    ],
    items: [
      { name: 'Ceramic Non-Stick Cookware Set', desc: '10-piece premium ceramic pots and pans set. Toxin-free and easy to clean.', price: 149.99 },
      { name: 'Stainless Steel Espresso Machine', desc: 'Brew barista-quality espresso at home with this 15-bar pressure pump machine.', price: 299.00 },
      { name: 'Memory Foam Bed Pillows', desc: 'Set of 2 cooling memory foam pillows designed for perfect neck and spine alignment.', price: 45.00 },
      { name: 'Robot Vacuum Cleaner', desc: 'Smart navigation robot vacuum with powerful suction for pet hair, carpets, and hard floors.', price: 199.50 },
      { name: 'Aromatherapy Essential Oil Diffuser', desc: 'Ultrasonic diffuser with 7 ambient light colors and whisper-quiet operation.', price: 34.99 }
    ]
  },
  'Beauty & Personal Care': {
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80'
    ],
    items: [
      { name: 'Hyaluronic Acid Face Serum', desc: 'Deeply hydrating serum that plumps skin and reduces the appearance of fine lines.', price: 28.00 },
      { name: 'SPF 50 Mineral Sunscreen', desc: 'Lightweight, non-greasy broad spectrum protection with zinc oxide.', price: 22.00 },
      { name: 'Vitamin C Brightening Moisturizer', desc: 'Daily face cream packed with Vitamin C to even skin tone and boost radiance.', price: 35.00 },
      { name: 'Electric Sonic Toothbrush', desc: 'Rechargeable toothbrush with 4 modes and a 2-minute smart timer.', price: 49.99 },
      { name: 'Organic Moroccan Argan Oil', desc: '100% pure cold-pressed argan oil for healthy hair, skin, and nails.', price: 18.50 }
    ]
  },
  'Groceries': {
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80',
      'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80'
    ],
    items: [
      { name: 'Organic Extra Virgin Olive Oil', desc: 'Cold-pressed, unrefined olive oil sourced directly from Italian estates.', price: 16.99 },
      { name: 'Artisan Whole Bean Coffee', desc: 'Medium roast fair-trade coffee beans with notes of chocolate and caramel.', price: 14.50 },
      { name: 'Raw Manuka Honey', desc: 'Premium New Zealand Manuka honey, perfect for tea or wellness routines.', price: 29.99 },
      { name: 'Himalayan Pink Salt Grinder', desc: '100% natural, mineral-rich pink salt in an easy-to-use glass grinder.', price: 8.50 },
      { name: 'Gluten-Free Rolled Oats', desc: 'Hearty, whole grain organic oats for a healthy and fulfilling breakfast.', price: 6.99 }
    ]
  },
  'Books & Stationery': {
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
      'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80'
    ],
    items: [
      { name: 'The Silent Patient - Hardcover', desc: 'A gripping psychological thriller that will keep you guessing until the very end.', price: 18.00 },
      { name: 'Premium Leather Journal', desc: 'Handcrafted leather notebook with thick, bleed-resistant lined paper.', price: 24.99 },
      { name: 'Fine-Liner Pen Set', desc: 'Set of 12 archival ink pens, perfect for drawing, journaling, and drafting.', price: 15.50 },
      { name: 'Atomic Habits by James Clear', desc: 'An easy and proven way to build good habits and break bad ones.', price: 14.99 },
      { name: 'Modern Desk Organizer', desc: 'Bamboo wood organizer with compartments for pens, phone, and sticky notes.', price: 22.00 }
    ]
  },
  'Sports & Fitness': {
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80'
    ],
    items: [
      { name: 'Premium Non-Slip Yoga Mat', desc: 'Eco-friendly 6mm thick yoga mat with alignment lines for perfect posture.', price: 35.00 },
      { name: 'Adjustable Dumbbell Set', desc: 'Space-saving dumbbells that adjust from 5 to 52.5 lbs with a simple dial.', price: 199.00 },
      { name: 'Whey Protein Isolate 2lbs', desc: 'Fast-absorbing, delicious chocolate protein powder for muscle recovery.', price: 45.99 },
      { name: 'Deep Tissue Massage Gun', desc: 'Percussion muscle massager with 6 attachments and 30 speed levels.', price: 89.99 },
      { name: 'Resistance Band Set', desc: 'Pack of 5 varied resistance bands with handles, door anchor, and carry bag.', price: 24.50 }
    ]
  },
  'Automotive': {
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      'https://images.unsplash.com/photo-1600706432502-77a0e2e32771?w=800&q=80',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80'
    ],
    items: [
      { name: 'Portable Car Jump Starter', desc: '1000A peak portable lithium battery jump starter with built-in LED flashlight.', price: 69.99 },
      { name: 'Premium Car Wash Kit', desc: 'Complete 10-piece kit including soap, wax, microfiber towels, and wash mitt.', price: 49.00 },
      { name: 'Digital Tire Pressure Gauge', desc: 'Accurate and easy-to-read tire gauge with illuminated nozzle and display.', price: 15.99 },
      { name: 'Universal Magnetic Phone Mount', desc: 'Securely mount your smartphone to any car dashboard or windshield.', price: 19.99 },
      { name: 'All-Weather Floor Mats', desc: 'Heavy-duty rubber floor mats designed to protect your car interior from dirt and spills.', price: 39.50 }
    ]
  },
  'Toys & Baby Products': {
    images: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
      'https://images.unsplash.com/photo-1555448248-2571daf6344b?w=800&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'
    ],
    items: [
      { name: 'Classic Wooden Building Blocks', desc: '100-piece set of durable, safe, and colorful wooden blocks for toddlers.', price: 29.99 },
      { name: 'Video Baby Monitor', desc: 'High-res camera monitor with two-way audio, night vision, and room temperature sensor.', price: 129.00 },
      { name: 'Ergonomic Baby Carrier', desc: 'Comfortable, multi-position baby carrier made with breathable mesh fabric.', price: 85.00 },
      { name: 'Interactive Learning Tablet', desc: 'Educational toy for kids featuring games, letters, and musical activities.', price: 35.00 },
      { name: 'Plush Elephant Toy', desc: 'Ultra-soft, cuddly plush elephant that makes the perfect companion for infants.', price: 18.50 }
    ]
  },
  'Gaming': {
    images: [
      'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80'
    ],
    items: [
      { name: 'Wireless Pro Gaming Controller', desc: 'Customizable controller with back paddles, trigger stops, and rubberized grips.', price: 149.99 },
      { name: 'RGB Mechanical Keyboard', desc: 'Tenkeyless keyboard with Cherry MX Red switches and dynamic per-key lighting.', price: 109.00 },
      { name: 'Surround Sound Gaming Headset', desc: 'Immersive 7.1 surround sound headset with a noise-canceling microphone.', price: 79.50 },
      { name: '27-inch 144Hz Gaming Monitor', desc: 'Fast IPS panel with 1ms response time and G-Sync compatibility.', price: 299.00 },
      { name: 'Ergonomic Gaming Chair', desc: 'Racing-style chair with lumbar support, adjustable armrests, and recline function.', price: 189.99 }
    ]
  },
  'Health & Medical': {
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5e4b67e78?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80'
    ],
    items: [
      { name: 'Digital Blood Pressure Monitor', desc: 'Clinically accurate, easy-to-use upper arm monitor with a large LCD display.', price: 45.00 },
      { name: 'Fingertip Pulse Oximeter', desc: 'Fast and reliable SpO2 and pulse rate measurements in seconds.', price: 19.99 },
      { name: 'Comprehensive First Aid Kit', desc: '200-piece emergency kit for home, travel, or the workplace.', price: 29.50 },
      { name: 'Infrared Forehead Thermometer', desc: 'Non-contact, instant-read thermometer suitable for all ages.', price: 35.00 },
      { name: 'Daily Multivitamin Gummies', desc: 'Delicious adult gummies packed with essential vitamins and minerals.', price: 14.99 }
    ]
  },
  'Pet Supplies': {
    images: [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80'
    ],
    items: [
      { name: 'Orthopedic Dog Bed', desc: 'Supportive memory foam bed with a removable, machine-washable plush cover.', price: 55.00 },
      { name: 'Automatic Pet Water Fountain', desc: 'Ultra-quiet 2L water dispenser with triple-action carbon filter.', price: 28.50 },
      { name: 'Premium Grain-Free Dog Food', desc: 'Nutrient-rich salmon and sweet potato recipe for all life stages (15 lbs).', price: 42.00 },
      { name: 'Interactive Laser Cat Toy', desc: 'Automated rotating laser toy to keep your feline entertained for hours.', price: 24.99 },
      { name: 'Heavy-Duty Retractable Leash', desc: '16ft tangle-free tape leash suitable for dogs up to 110 lbs.', price: 18.50 }
    ]
  },
  'Jewelry & Accessories': {
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1599643478524-fb66fa5320e5?w=800&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
    ],
    items: [
      { name: 'Sterling Silver Pendant Necklace', desc: 'Elegant minimalist chain with a sparkling cubic zirconia pendant.', price: 49.00 },
      { name: 'Men\'s Minimalist Watch', desc: 'Sleek stainless steel watch with a genuine leather band and water resistance.', price: 125.00 },
      { name: 'Classic Aviator Sunglasses', desc: 'Polarized lenses with 100% UV protection and a durable metal frame.', price: 85.00 },
      { name: 'Genuine Leather Wallet', desc: 'Slim bifold wallet featuring RFID-blocking technology and multiple card slots.', price: 35.00 },
      { name: '14k Gold Plated Hoop Earrings', desc: 'Lightweight, hypoallergenic classic hoop earrings for everyday wear.', price: 29.50 }
    ]
  },
  'Office Supplies': {
    images: [
      'https://images.unsplash.com/photo-1497032205916-ac53390090ac?w=800&q=80',
      'https://images.unsplash.com/photo-1505085350318-6c810486c8f6?w=800&q=80',
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80'
    ],
    items: [
      { name: 'Ergonomic Mesh Office Chair', desc: 'Breathable backrest with adjustable lumbar support and padded armrests.', price: 159.00 },
      { name: 'Aluminum Laptop Stand', desc: 'Elevates your screen to eye level to improve posture and cooling.', price: 29.99 },
      { name: 'LED Desk Lamp with USB Port', desc: 'Dimmable lamp with 5 color modes and a built-in phone charging port.', price: 39.50 },
      { name: 'Heavy Duty Paper Shredder', desc: '12-sheet cross-cut shredder that easily destroys paper, CDs, and credit cards.', price: 89.00 },
      { name: 'Premium Printer Paper', desc: '500 sheets of bright white, jam-free paper ideal for all printers.', price: 12.99 }
    ]
  },
  'Digital Products': {
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'
    ],
    items: [
      { name: 'UI/UX Design Template Bundle', desc: 'A massive collection of modern web and mobile UI kits for Figma.', price: 49.00 },
      { name: 'Mastering Python - Video Course', desc: 'Comprehensive 20-hour video series covering everything from basics to advanced Python.', price: 89.99 },
      { name: 'Lightroom Photography Presets', desc: 'Set of 50 professional presets to instantly enhance your travel and portrait photos.', price: 25.00 },
      { name: 'Annual VPN Subscription', desc: 'Secure, high-speed, and unlimited bandwidth VPN service for up to 5 devices.', price: 59.99 },
      { name: 'Digital Planner 2026', desc: 'Interactive PDF planner compatible with GoodNotes and Notability.', price: 15.00 }
    ]
  }
};

async function fixEverything() {
  console.log('Connecting to database...');
  
  const res = await pool.query(`
    SELECT p.id as product_id, c.name as category_name 
    FROM products p
    JOIN product_categories pc ON pc.product_id = p.id
    JOIN categories c ON c.id = pc.category_id
  `);
  
  console.log(`Found ${res.rows.length} products. Performing complete fix...`);

  // Track how many items we've used per category to cycle through them
  const counters = {};

  let count = 0;
  for (const row of res.rows) {
    const catName = row.category_name;
    const catData = categoryData[catName] || categoryData['Electronics']; // fallback
    
    if (!counters[catName]) counters[catName] = 0;
    
    // Pick sequential item, cycle around if needed
    const itemIndex = counters[catName] % catData.items.length;
    const item = catData.items[itemIndex];
    
    // Pick random image from category
    const imageIndex = Math.floor(Math.random() * catData.images.length);
    const imageUrl = catData.images[imageIndex];

    counters[catName]++;

    // Update product info
    await pool.query(
      `UPDATE products SET title = $1, description = $2, price = $3 WHERE id = $4`,
      [item.name, item.desc, item.price, row.product_id]
    );

    // Update product image
    await pool.query(
      `UPDATE product_images SET image_url = $1 WHERE product_id = $2`,
      [imageUrl, row.product_id]
    );

    count++;
  }

  console.log(`Successfully fixed EVERYTHING! ${count} products now have correct names, descriptions, prices, and high-quality Unsplash images.`);
  await pool.end();
}

fixEverything().catch((err) => {
  console.error('Failed to fix everything:', err);
  process.exit(1);
});
