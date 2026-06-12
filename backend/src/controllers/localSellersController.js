import { query } from '../config/db.js';

export const getLocalSellers = async (req, res) => {
  try {
    const { city } = req.query;
    
    let sql = `
      SELECT s.id, s.name, s.city, s.state, s.rating, u.first_name, u.last_name
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      WHERE s.city IS NOT NULL
    `;
    let params = [];
    
    if (city && city.trim() !== '') {
      sql += ' AND s.city ILIKE $1';
      params.push(`%${city.trim()}%`);
    }
    
    sql += ' ORDER BY s.rating DESC NULLS LAST LIMIT 20';
    
    const storesRes = await query(sql, params);
    
    // Fetch a couple of top products for each store to display as previews
    const stores = await Promise.all(storesRes.rows.map(async (store) => {
      const productsRes = await query(`
        SELECT id, title, price 
        FROM products 
        WHERE store_id = $1 AND status = 'ACTIVE' AND stock_quantity > 0
        ORDER BY created_at DESC 
        LIMIT 3
      `, [store.id]);
      
      return {
        ...store,
        preview_products: productsRes.rows
      };
    }));
    
    res.json(stores);
  } catch (error) {
    console.error('Failed to fetch local sellers', error);
    res.status(500).json({ error: 'Failed to fetch local sellers' });
  }
};
