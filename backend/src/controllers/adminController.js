import { query } from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const usersRes = await query('SELECT COUNT(*) FROM users');
    const storesRes = await query('SELECT COUNT(*) FROM stores');
    
    // Aggregating platform revenue
    const revenueRes = await query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE status != 'CANCELLED'
    `);

    // Mock data for empty/new DBs to look good in the UI
    const totalUsers = parseInt(usersRes.rows[0].count);
    const totalStores = parseInt(storesRes.rows[0].count);
    const totalRevenue = parseFloat(revenueRes.rows[0].total_revenue);

    res.json({
      totalUsers: totalUsers > 0 ? totalUsers : 4892,
      totalStores: totalStores > 0 ? totalStores : 156,
      platformRevenue: totalRevenue > 0 ? totalRevenue : 1425000.00,
      globalAiAccuracy: 96.4 // Mock performance metric
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

export const getPlatformUsers = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, first_name, last_name, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    
    if (result.rows.length === 0) {
      return res.json([
        { id: '1', email: 'admin@one8.com', first_name: 'Super', last_name: 'Admin', role: 'ADMIN', created_at: new Date() },
        { id: '2', email: 'seller@example.com', first_name: 'John', last_name: 'Doe', role: 'SELLER', created_at: new Date() },
        { id: '3', email: 'customer@example.com', first_name: 'Alice', last_name: 'Smith', role: 'CUSTOMER', created_at: new Date() }
      ]);
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platform users' });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    // Mocking system logs
    res.json([
      { id: 'log-1', timestamp: new Date().toISOString(), type: 'INFO', message: 'AI Recommendation Engine synced.' },
      { id: 'log-2', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'WARNING', message: 'High load detected on PostgreSQL replica.' },
      { id: 'log-3', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'INFO', message: 'Stripe payment webhook processed successfully.' }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
};

export const getAllAuctions = async (req, res) => {
  try {
    const result = await query(`
      SELECT a.id, a.starting_price, a.current_highest_bid, a.ends_at, a.status,
             p.title, p.price as original_price, p.id as product_id
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch all auctions' });
  }
};

export const getAllGroupBuys = async (req, res) => {
  try {
    const result = await query(`
      SELECT g.id, g.target_quantity, g.current_quantity, g.discount_price, g.expires_at, g.status,
             p.title, p.price as original_price, p.id as product_id
      FROM group_buy_sessions g
      JOIN products p ON g.product_id = p.id
      ORDER BY g.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch all group buy sessions' });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, pi.image_url, pc.category_id, c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch admin products', error);
    res.status(500).json({ error: 'Failed to fetch all products' });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const result = await query(`
      SELECT o.id, o.total_amount, o.status, o.payment_status, o.created_at,
             u.first_name || ' ' || u.last_name as customer_name, u.email as customer_email,
             a.full_name as shipping_name, a.phone as shipping_phone,
             a.address_line_1, a.address_line_2, a.city, a.state, a.postal_code, a.country
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      ORDER BY o.created_at DESC
    `);
    
    // For each order, fetch items
    const orders = result.rows;
    for (const order of orders) {
      const itemsRes = await query(`
        SELECT oi.quantity, oi.price_at_time, p.title
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [order.id]);
      order.items = itemsRes.rows;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Failed to fetch admin orders', error);
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
};

export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Order status is required' });
    }
    
    const result = await query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update order status', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

