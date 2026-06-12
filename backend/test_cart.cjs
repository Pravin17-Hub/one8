const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: 'one8',
});

async function run() {
  try {
    const userRes = await pool.query('SELECT id, email FROM users LIMIT 3');
    console.log('Users:', userRes.rows);

    const prodRes = await pool.query('SELECT id, title FROM products LIMIT 3');
    console.log('Products:', prodRes.rows);

    if (userRes.rows.length > 0 && prodRes.rows.length > 0) {
      const uId = userRes.rows[0].id;
      const pId = prodRes.rows[0].id;
      console.log(`Testing cart insert for user: ${uId}, product: ${pId}`);
      
      // Try to insert
      try {
        const insertRes = await pool.query(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + $3 RETURNING *',
          [uId, pId, 1]
        );
        console.log('Insert Result:', insertRes.rows);
      } catch (insertErr) {
        console.error('Insert Error:', insertErr.message);
      }
      
      const cartRes = await pool.query('SELECT * FROM cart');
      console.log('Current Cart records:', cartRes.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
