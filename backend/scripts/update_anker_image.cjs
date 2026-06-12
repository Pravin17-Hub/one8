const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function update() {
  try {
    // We update the product_images table for products matching "Anker 737"
    const res = await pool.query(`
      SELECT id, title FROM products WHERE title LIKE '%Anker 737%'
    `);
    
    for (const prod of res.rows) {
      console.log(`Updating image for: ${prod.title}`);
      await pool.query(`
        UPDATE product_images
        SET image_url = 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400'
        WHERE product_id = $1
      `, [prod.id]);
    }
    
    console.log('Update complete.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

update();
