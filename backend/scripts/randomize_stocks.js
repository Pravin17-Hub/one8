import { query } from '../src/config/db.js';

async function randomize() {
  try {
    const res = await query('UPDATE products SET stock_quantity = floor(random() * 90 + 10)::integer');
    console.log(`Successfully randomized stocks. Rows updated: ${res.rowCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to randomize stocks:', error);
    process.exit(1);
  }
}

randomize();
