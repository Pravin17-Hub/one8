import { query } from '../src/config/db.js';

async function fix() {
  try {
    // 1. Get iPhone 16 Pro ID
    const iphoneRes = await query("SELECT id FROM products WHERE title = 'iPhone 16 Pro'");
    if (iphoneRes.rows.length > 0) {
      const iphoneId = iphoneRes.rows[0].id;
      // Delete existing just in case
      await query("DELETE FROM product_images WHERE product_id = $1", [iphoneId]);
      await query(
        "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)",
        [iphoneId, '/products/electronics/iphone16pro-256gb.jpg']
      );
      console.log('Fixed iPhone 16 Pro image');
    }

    // 2. Fix Anker 737 image URLs
    const ankerRes = await query("SELECT id FROM products WHERE title ILIKE '%Anker%'");
    for (const row of ankerRes.rows) {
      await query("DELETE FROM product_images WHERE product_id = $1", [row.id]);
      await query(
        "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)",
        [row.id, '/products/electronics/anker737-powerbank.jpg']
      );
      console.log('Fixed Anker 737 image for product:', row.id);
    }
    
    console.log('All image fixes executed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to fix images:', error);
    process.exit(1);
  }
}

fix();
