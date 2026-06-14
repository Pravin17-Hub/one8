import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

async function run() {
  try {
    // 1. Dr. Morepen BP Monitor
    const bpRes = await pool.query("SELECT id FROM products WHERE title = 'Dr. Morepen Blood Pressure Monitor BP02'");
    if (bpRes.rows.length > 0) {
      const id = bpRes.rows[0].id;
      await pool.query(
        "UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true",
        ['/products/health/dr-morepen-bp-monitor.jpeg', id]
      );
      console.log('Updated Dr. Morepen BP Monitor image path');
    }

    // 2. Flamingo Cervical Collar
    const collarRes = await pool.query("SELECT id FROM products WHERE title = 'Flamingo Cervical Collar'");
    if (collarRes.rows.length > 0) {
      const id = collarRes.rows[0].id;
      // Make sure a primary image record exists
      const imgRes = await pool.query("SELECT id FROM product_images WHERE product_id = $1", [id]);
      if (imgRes.rows.length === 0) {
        await pool.query(
          "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)",
          [id, '/products/health/flamingo-cervical-collar.jpg']
        );
      } else {
        await pool.query(
          "UPDATE product_images SET image_url = $1, is_primary = true WHERE product_id = $2",
          ['/products/health/flamingo-cervical-collar.jpg', id]
        );
      }
      console.log('Updated Flamingo Cervical Collar image path');
    }

    // 3. IFB Front Load Washing Machine 8kg
    const ifbRes = await pool.query("SELECT id FROM products WHERE title = 'IFB Front Load Washing Machine 8kg'");
    if (ifbRes.rows.length > 0) {
      const id = ifbRes.rows[0].id;
      await pool.query(
        "UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true",
        ['/products/home/ifb-washing-machine.jp.jpg', id]
      );
      console.log('Updated IFB Washing Machine image path');
    }

    // 4. Mamaearth Vitamin C Serum
    const mamaRes = await pool.query("SELECT id FROM products WHERE title = 'Mamaearth Vitamin C Serum'");
    if (mamaRes.rows.length > 0) {
      const id = mamaRes.rows[0].id;
      await pool.query(
        "UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true",
        ['/products/beauty/mamaearth-vitamin-c-serum.webp', id]
      );
      console.log('Updated Mamaearth Serum image path');
    }

    // 5. MI 2026 Official Jersey
    const jerseyRes = await pool.query("SELECT id FROM products WHERE title = 'MI 2026 Official Jersey'");
    if (jerseyRes.rows.length > 0) {
      const id = jerseyRes.rows[0].id;
      await pool.query(
        "UPDATE product_images SET image_url = $1 WHERE product_id = $2",
        ['/products/sports/mi-jersey.jpg', id]
      );
      console.log('Updated MI Jersey image path');
    }

    await pool.end();
    console.log('Done fixing missing/broken image paths!');
  } catch (err) {
    console.error('Error fixing images:', err);
  }
}

run();
