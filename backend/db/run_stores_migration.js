import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '004_local_stores.sql'), 'utf8');
    await pool.query(sql);
    console.log('Local Stores schema migration successful.');
    
    // Seed locations for existing stores
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Austin', 'Miami'];
    const storesRes = await pool.query('SELECT id FROM stores');
    
    for (let i = 0; i < storesRes.rows.length; i++) {
      const storeId = storesRes.rows[i].id;
      const randomCity = cities[i % cities.length];
      const randomRating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1); // Random rating between 3.5 and 5.0
      
      await pool.query('UPDATE stores SET city = $1, state = $2, rating = $3 WHERE id = $4', [randomCity, 'NA', randomRating, storeId]);
    }
    
    console.log('Mock Store locations seeded.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
};

runMigration();
