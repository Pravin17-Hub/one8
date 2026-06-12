import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import pool from '../src/config/db.js';

pool.query("SELECT title FROM products WHERE title ILIKE '%Digital Product%' OR title ILIKE '%Product %' LIMIT 10")
  .then(res => {
    console.log(res.rows);
    process.exit(0);
  });
