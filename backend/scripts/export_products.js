import { query } from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportProducts() {
  try {
    const sql = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.price,
        p.stock_quantity,
        p.status,
        p.rating,
        p.ai_match_score,
        c.name as category_name,
        pi.image_url
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      ORDER BY p.title ASC
    `;
    const res = await query(sql);
    
    // Convert decimal strings to numbers and clean up IDs
    const products = res.rows.map(row => ({
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      stock_quantity: parseInt(row.stock_quantity) || 0,
      status: row.status,
      rating: parseFloat(row.rating) || 0,
      ai_match_score: parseInt(row.ai_match_score) || 0,
      category_name: row.category_name || null,
      image_url: row.image_url || null
    }));

    const outputPath = path.resolve(__dirname, '../../product.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
    
    console.log(`Successfully exported ${products.length} products to ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to export products:', error);
    process.exit(1);
  }
}

exportProducts();
