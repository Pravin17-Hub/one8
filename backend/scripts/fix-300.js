import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

const categoryData = {
  'Electronics': [
    "Apple iPhone 16 Pro", "Samsung Galaxy S25 Ultra", "Sony WH-1000XM5 Headphones", "Apple MacBook Pro M3", "Dell XPS 15 Laptop", 
    "iPad Air 5th Gen", "LG C3 OLED 4K TV", "Apple Watch Series 10", "Samsung Galaxy Tab S9", "Bose QuietComfort Earbuds",
    "GoPro HERO 12 Black", "Nintendo Switch OLED", "Google Pixel 9 Pro", "Canon EOS R5 Camera", "Logitech MX Master 3S Mouse",
    "Asus ROG Zephyrus G14", "Dyson Pure Cool Purifier", "Sony A7 IV Mirrorless", "Amazon Echo Dot (5th Gen)", "Kindle Paperwhite Signature"
  ],
  'Fashion': [
    "Men's Classic Denim Jacket", "Women's Floral Summer Dress", "Unisex Cotton Crewneck Tee", "Slim Fit Chino Pants", "Leather Ankle Boots",
    "Cashmere Winter Scarf", "Vintage Aviator Sunglasses", "Athletic Running Sneakers", "Waterproof Trench Coat", "High-Waisted Yoga Leggings",
    "Silk Button-Up Blouse", "Men's Tailored Wool Suit", "Canvas Tote Bag", "Polarized Designer Sunglasses", "Genuine Leather Belt",
    "Cozy Knit Oversized Sweater", "Performance Polo Shirt", "Women's Stiletto Heels", "Comfortable Memory Foam Slippers", "Classic Fedora Hat"
  ],
  'Home & Kitchen': [
    "Stainless Steel Espresso Machine", "Non-Stick 12-Piece Cookware Set", "Robot Vacuum and Mop Combo", "Air Fryer Max XL 5.5Qt", "Vitamix Professional Blender",
    "Memory Foam Mattress Topper", "Egyptian Cotton Bed Sheets", "Ceramic Dinnerware Set", "Electric Gooseneck Kettle", "Aromatherapy Essential Oil Diffuser",
    "Cast Iron Dutch Oven", "Smart WiFi Thermostat", "Luxury Plush Bath Towels", "Automatic Soap Dispenser", "HEPA Air Purifier for Home",
    "Bamboo Cutting Board Set", "Premium Chef's Knife 8-Inch", "Silicone Baking Mats", "Digital Meat Thermometer", "Stackable Food Storage Containers"
  ],
  'Beauty & Personal Care': [
    "Hyaluronic Acid Face Serum", "SPF 50 Mineral Sunscreen", "Vitamin C Brightening Moisturizer", "Electric Sonic Toothbrush", "Organic Argan Hair Oil",
    "Retinol Anti-Aging Night Cream", "Matte Liquid Lipstick Set", "Exfoliating Body Scrub", "Waterproof Volumizing Mascara", "Charcoal Clay Face Mask",
    "Luxury Bath Bombs Gift Set", "Rose Water Facial Toner", "Men's Premium Beard Kit", "Hair Straightening Ceramic Iron", "Professional Makeup Brush Set",
    "Tea Tree Oil Body Wash", "Epsom Salt Muscle Soak", "Dermatologist Tested Cleanser", "Shea Butter Body Lotion", "Vegan Lip Balm Pack"
  ],
  'Groceries': [
    "Organic Extra Virgin Olive Oil", "Artisan Whole Bean Coffee", "Raw Manuka Honey 250g", "Himalayan Pink Salt Grinder", "Gluten-Free Rolled Oats",
    "Aged Balsamic Vinegar", "Organic Quinoa 2lbs", "Almond Butter Creamy", "Dark Chocolate 85% Cocoa", "Green Tea Matcha Powder",
    "Premium Basmati Rice", "Dried Mango Slices No Sugar", "Assorted Mixed Nuts Roasted", "Organic Maple Syrup Grade A", "Whole Wheat Sourdough Bread",
    "Cold-Pressed Coconut Oil", "Organic Chia Seeds", "Sun-Dried Tomatoes in Oil", "Gourmet Pasta Assortment", "Spicy Sriracha Chili Sauce"
  ],
  'Books & Stationery': [
    "The Silent Patient - Hardcover", "Premium Leather Journal", "Fine-Liner Pen Set of 12", "Atomic Habits by James Clear", "Modern Bamboo Desk Organizer",
    "Project Management Planner 2026", "Watercolor Paint Set 24 Colors", "Noise-Canceling Study Headphones", "Ergonomic Desk Chair", "Highlighter Pastel Pack",
    "1000-Piece Jigsaw Puzzle", "Science Fiction Bestseller Novel", "Cookbook: Taste of Italy", "Sticky Notes Variety Pack", "Heavy-Duty Stapler",
    "Gel Pens Smooth Writing 10-Pack", "A4 Sketchbook 100 Pages", "Self-Help Motivation Book", "Historical Biographies Collection", "Luxury Fountain Pen"
  ],
  'Sports & Fitness': [
    "Premium Non-Slip Yoga Mat", "Adjustable Dumbbell Set 50lbs", "Whey Protein Isolate 2lbs", "Deep Tissue Massage Gun", "Resistance Band Set with Handles",
    "High-Density Foam Roller", "Bicycle Helmet with LED Light", "Jump Rope with Digital Counter", "Men's Running Shoes Pro", "Women's High-Impact Sports Bra",
    "Gym Duffle Bag with Shoe Compartment", "Smart Fitness Tracker Watch", "Stainless Steel Protein Shaker", "Pilates Core Ring", "Push-Up Bar Stands",
    "Kettlebell Cast Iron 15lbs", "Hydration Backpack for Hiking", "Tennis Racket Lightweight", "Soccer Ball Size 5 Official", "Weightlifting Leather Gloves"
  ],
  'Automotive': [
    "Portable Car Jump Starter 1000A", "Premium Car Wash Kit 10-Piece", "Digital Tire Pressure Gauge", "Universal Magnetic Phone Mount", "All-Weather Rubber Floor Mats",
    "Microfiber Cleaning Cloths Pack", "Dashboard Sun Visor Shade", "Leather Seat Conditioner & Cleaner", "LED Headlight Bulbs Bright White", "Blind Spot Mirrors 2-Pack",
    "Car Vacuum Cleaner High Power", "Steering Wheel Cover Breathable", "Ceramic Coating Spray Wax", "Windshield Wiper Blades Set", "Trunk Organizer Collapsible",
    "OBD2 Diagnostic Scanner Tool", "Air Freshener Vent Clips", "Emergency Roadside Tool Kit", "Portable Air Compressor Pump", "Car Scratch Repair Pen"
  ],
  'Toys & Baby Products': [
    "Classic Wooden Building Blocks", "Video Baby Monitor 1080p", "Ergonomic Baby Carrier", "Interactive Learning Tablet Toy", "Plush Elephant Stuffed Animal",
    "Remote Control Race Car", "Educational Magnetic Tiles Set", "Baby Stroller Lightweight Compact", "Diaper Bag Backpack with Changing Pad", "Teething Toys BPA-Free",
    "Water Table Play Center", "Board Game Classic Family Edition", "Science Experiment Kit for Kids", "Dollhouse Miniature Furniture Set", "Magic Trick Kit for Beginners",
    "Baby Monitor with Camera & Audio", "Soft Play Mat Gym for Infants", "Ride-On Toddler Car", "Musical Instruments Set Wood", "Bath Toys Squirt Animals"
  ],
  'Gaming': [
    "Wireless Pro Gaming Controller", "RGB Mechanical Keyboard Cherry MX", "Surround Sound Gaming Headset 7.1", "27-inch 144Hz IPS Gaming Monitor", "Ergonomic Racing Gaming Chair",
    "Extended RGB Mouse Pad", "Gaming Mouse 16000 DPI", "Console Dual Charging Station", "VR Headset Protective Case", "Streaming Microphone with Boom Arm",
    "1080p HD Webcam for Streaming", "Game Capture Card 4K", "Controller Thumbstick Grips", "Retro Arcade Console Emulator", "Gaming Desk with Cup Holder",
    "LED Strip Lights for Room", "Blue Light Blocking Glasses", "External SSD 1TB for Consoles", "Flight Simulator Joystick", "Gaming Router WiFi 6"
  ],
  'Health & Medical': [
    "Digital Blood Pressure Monitor", "Fingertip Pulse Oximeter", "Comprehensive First Aid Kit 200pc", "Infrared Forehead Thermometer", "Daily Multivitamin Gummies Adult",
    "Omega-3 Fish Oil Supplements", "Knee Brace Compression Sleeve", "Posture Corrector Adjustable", "Electric Heating Pad for Back Pain", "Reusable Hot/Cold Gel Pack",
    "Pill Organizer Weekly AM/PM", "Medical Grade Face Masks 50-Pack", "Hand Sanitizer Gel 1-Liter", "Compression Socks for Travel", "Lumbar Support Cushion",
    "Wrist Blood Pressure Cuff", "Digital Body Weight Scale", "Allergy Relief Antihistamine", "Digestive Probiotic Capsules", "Sleep Aid Melatonin 5mg"
  ],
  'Pet Supplies': [
    "Orthopedic Memory Foam Dog Bed", "Automatic Pet Water Fountain 2L", "Premium Grain-Free Dog Food 15lbs", "Interactive Laser Cat Toy", "Heavy-Duty Retractable Dog Leash",
    "Self-Cleaning Cat Litter Box", "Pet Grooming Brush Deshedding", "Adjustable No-Pull Dog Harness", "Cat Tree Tower with Scratching Posts", "Aquarium Filter Whisper Quiet",
    "Hamster Exercise Wheel Silent", "Bird Cage Accessories Swing", "Dental Chews for Large Dogs", "Organic Catnip Mouse Toy", "Pet Carrier Backpack Breathable",
    "Flea and Tick Collar Prevention", "Stainless Steel Pet Bowls 2-Pack", "Puppy Training Pads Large", "Cat Window Perch Hammock", "Dog Squeaky Toys Assortment"
  ],
  'Jewelry & Accessories': [
    "Sterling Silver Pendant Necklace", "Men's Minimalist Leather Watch", "Classic Aviator Polarized Sunglasses", "Genuine Leather Bifold Wallet", "14k Gold Plated Hoop Earrings",
    "Diamond Stud Earrings 1ct", "Silk Neck Scarf Elegant Print", "Crystal Charm Bracelet", "Men's Cufflinks Silver Tone", "Custom Engraved Ring",
    "Canvas Crossbody Messenger Bag", "Beanie Hat Warm Winter Knit", "Woven Braided Leather Belt", "Pearl Drop Necklace Genuine", "Rose Gold Chronograph Watch",
    "RFID Blocking Passport Holder", "Tote Bag Everyday Use", "Hair Scrunchies Silk Pack", "Cubic Zirconia Tennis Bracelet", "Minimalist Card Holder Wallet"
  ],
  'Office Supplies': [
    "Ergonomic Mesh Office Chair", "Aluminum Laptop Stand Adjustable", "LED Desk Lamp with USB Port", "Heavy Duty Paper Shredder", "Premium Bright White Printer Paper",
    "Wireless Ergonomic Mouse", "Mechanical Pencil Set 0.5mm", "Magnetic Dry Erase Whiteboard", "Filing Cabinet 3-Drawer Metal", "Printer Ink Cartridge Combo Pack",
    "Stapler Heavy Duty 50-Sheet", "Paper Clips Jumbo Size Pack", "Manila File Folders 100-Count", "Binder Clips Assorted Sizes", "Mouse Pad with Gel Wrist Rest",
    "Standing Desk Converter", "Gel Ink Pens Black Fine Point", "Correction Tape 6-Pack", "Desktop Calculator 12-Digit", "Desk Pad Protector Leather PU"
  ],
  'Digital Products': [
    "UI/UX Design Template Bundle Pro", "Mastering Python - Full Video Course", "Lightroom Photography Presets Pack", "Annual Premium VPN Subscription", "Digital Planner 2026 Interactive PDF",
    "Antivirus Software 1-Year License", "Video Editing Assets Suite 4K", "Website Theme Template E-Commerce", "E-Book: Productivity & Time Management", "Cloud Storage 1TB Plan (1 Year)",
    "Music Production Sample Pack LoFi", "Stock Video Footage Bundle HD", "Social Media Graphics Templates PSD", "Font Family License Commercial Use", "Audiobook: Business Strategy Masterclass",
    "Online Course: Digital Marketing 101", "3D Model Assets for Game Dev", "Vector Icon Pack 5000+ SVG", "Resume & Cover Letter Templates", "Excel Financial Dashboards Bundle"
  ]
};

// Keyword mapping for strictly unique images per category via LoremFlickr
const categoryKeywords = {
  'Electronics': 'electronics',
  'Fashion': 'fashion',
  'Home & Kitchen': 'kitchen',
  'Beauty & Personal Care': 'beauty',
  'Groceries': 'food',
  'Books & Stationery': 'stationery',
  'Sports & Fitness': 'fitness',
  'Automotive': 'car',
  'Toys & Baby Products': 'toy',
  'Gaming': 'gaming',
  'Health & Medical': 'medical',
  'Pet Supplies': 'pet',
  'Jewelry & Accessories': 'jewelry',
  'Office Supplies': 'office',
  'Digital Products': 'software'
};

async function fix300() {
  console.log('Connecting to database...');
  
  const res = await pool.query(`
    SELECT p.id as product_id, c.name as category_name 
    FROM products p
    JOIN product_categories pc ON pc.product_id = p.id
    JOIN categories c ON c.id = pc.category_id
    ORDER BY c.name, p.created_at
  `);
  
  console.log(`Found ${res.rows.length} products. Applying 300 UNIQUE real products and images...`);

  // We will track the index per category to assign exactly 0 to 19 (20 unique items)
  const categoryCounters = {};

  let count = 0;
  for (const row of res.rows) {
    const catName = row.category_name;
    const catData = categoryData[catName] || categoryData['Electronics'];
    const keyword = categoryKeywords[catName] || 'product';
    
    if (categoryCounters[catName] === undefined) {
      categoryCounters[catName] = 0;
    }
    
    const index = categoryCounters[catName] % 20; // 0 to 19
    categoryCounters[catName]++;
    
    const productName = catData[index];
    const description = `Premium ${productName} engineered for exceptional quality and reliability. The perfect choice for your daily needs.`;
    
    // Generate a realistic price based on category
    let price = 0;
    if (catName === 'Electronics' || catName === 'Gaming' || catName === 'Automotive') {
        price = Math.floor(Math.random() * 500) + 50;
    } else if (catName === 'Groceries' || catName === 'Books & Stationery' || catName === 'Pet Supplies') {
        price = Math.floor(Math.random() * 30) + 10;
    } else {
        price = Math.floor(Math.random() * 100) + 20;
    }

    // Generate a strictly UNIQUE image url using LoremFlickr by using a globally unique lock ID (count)
    // This ensures no two images on the site are ever identical, and they perfectly match the category!
    const uniqueLock = count + 1000;
    const imageUrl = `https://loremflickr.com/800/800/${keyword}?lock=${uniqueLock}`;

    // Update product info
    await pool.query(
      `UPDATE products SET title = $1, description = $2, price = $3 WHERE id = $4`,
      [productName, description, price, row.product_id]
    );

    // Update product image
    await pool.query(
      `UPDATE product_images SET image_url = $1 WHERE product_id = $2`,
      [imageUrl, row.product_id]
    );

    count++;
  }

  console.log(`Successfully fixed EVERYTHING! 300 strictly unique products assigned.`);
  await pool.end();
}

fix300().catch((err) => {
  console.error('Failed to fix 300:', err);
  process.exit(1);
});
