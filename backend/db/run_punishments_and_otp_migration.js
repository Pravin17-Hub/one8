import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '005_auction_punishments_and_otp.sql'), 'utf8');
    await pool.query(sql);
    console.log('Auction punishments, suspensions, and OTP schema migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
};

runMigration();
