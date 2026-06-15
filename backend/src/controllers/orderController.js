import { query } from '../config/db.js';

export const checkout = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    
    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.firstName || !shippingAddress.lastName) {
      return res.status(400).json({ error: 'Shipping address is required to place an order.' });
    }
    
    // Check if user is suspended
    const userRes = await query('SELECT is_suspended, trust_score FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length > 0 && userRes.rows[0].is_suspended) {
      return res.status(403).json({ error: `Your account is suspended due to low trust score (${userRes.rows[0].trust_score}).` });
    }
    
    // 1. Fetch user's cart
    const cartRes = await query(`
      SELECT c.product_id, c.quantity, p.price, p.stock_quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.user.id]);
    
    if (cartRes.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Create address record in addresses table
    const fullName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
    const phone = shippingAddress.phone || '0000000000';
    const addressLine1 = shippingAddress.addressLine1;
    const addressLine2 = shippingAddress.addressLine2 || '';
    const city = shippingAddress.city;
    const state = shippingAddress.state || 'Delhi';
    const postalCode = shippingAddress.postalCode;
    const country = shippingAddress.country || 'India';
    
    const addressRes = await query(`
      INSERT INTO addresses (user_id, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [req.user.id, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country]);
    
    const addressId = addressRes.rows[0].id;
    
    // 2. Calculate Total
    const totalAmount = cartRes.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 3. Create Order
    const orderRes = await query(`
      INSERT INTO orders (customer_id, address_id, total_amount, status, payment_status)
      VALUES ($1, $2, $3, 'PENDING', 'COMPLETED')
      RETURNING id
    `, [req.user.id, addressId, totalAmount]);
    
    const orderId = orderRes.rows[0].id;
    
    // 4. Create Order Items & Update Stock (Normally done in a transaction)
    for (const item of cartRes.rows) {
      await query(`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
        VALUES ($1, $2, $3, $4)
      `, [orderId, item.product_id, item.quantity, item.price]);
      
      // Reduce stock
      await query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.product_id]);

      // Notify the seller
      try {
        const sellerInfo = await query(`
          SELECT s.owner_id, p.title 
          FROM products p
          JOIN stores s ON p.store_id = s.id
          WHERE p.id = $1
        `, [item.product_id]);
        
        if (sellerInfo.rows.length > 0) {
          const { owner_id, title } = sellerInfo.rows[0];
          const notifTitle = 'New Order Placed';
          const notifMsg = `Your product "${title}" has been ordered (Qty: ${item.quantity}). Customer: ${fullName}. Phone: ${phone}. Shipping Address: ${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}, ${postalCode}, ${country}.`;
          
          await query(`
            INSERT INTO notifications (user_id, title, message)
            VALUES ($1, $2, $3)
          `, [owner_id, notifTitle, notifMsg]);
        }
      } catch (err) {
        console.error('Failed to notify seller for item:', item.product_id, err);
      }
    }
    
    // 5. Clear Cart
    await query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    
    res.json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(orders.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch order
    const orderRes = await query('SELECT * FROM orders WHERE id = $1 AND customer_id = $2', [id, req.user.id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderRes.rows[0];

    // Fetch items
    const itemsRes = await query(`
      SELECT oi.*, p.title, 
        (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);
    
    order.items = itemsRes.rows;

    // Fetch address if it exists
    if (order.address_id) {
      const addrRes = await query('SELECT * FROM addresses WHERE id = $1', [order.address_id]);
      if (addrRes.rows.length > 0) order.shipping_address = addrRes.rows[0];
    } else {
      order.shipping_address = null;
    }

    res.json(order);
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

export const payOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAddress } = req.body;
    
    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.firstName || !shippingAddress.lastName) {
      return res.status(400).json({ error: 'Shipping address is required to complete payment.' });
    }

    // Check if user is suspended
    const userRes = await query('SELECT is_suspended, trust_score FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length > 0 && userRes.rows[0].is_suspended) {
      return res.status(403).json({ error: `Your account is suspended due to low trust score (${userRes.rows[0].trust_score}).` });
    }

    // Fetch order
    const orderRes = await query('SELECT * FROM orders WHERE id = $1 AND customer_id = $2', [id, req.user.id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderRes.rows[0];

    if (order.payment_status === 'COMPLETED') {
      return res.status(400).json({ error: 'Order is already paid.' });
    }

    // Create address
    const fullName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
    const phone = shippingAddress.phone || '0000000000';
    const addressRes = await query(`
      INSERT INTO addresses (user_id, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [req.user.id, fullName, phone, shippingAddress.addressLine1, shippingAddress.addressLine2 || '', shippingAddress.city, shippingAddress.state || 'Delhi', shippingAddress.postalCode, shippingAddress.country || 'India']);
    
    const addressId = addressRes.rows[0].id;

    // Update order status, address, and stamp created_at to now (re-anchors completion timestamp)
    await query(`
      UPDATE orders 
      SET address_id = $1, status = 'PAID', payment_status = 'COMPLETED', created_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [addressId, id]);

    // Retrieve items to update stock
    const itemsRes = await query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
    for (const item of itemsRes.rows) {
      await query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    res.json({ message: 'Payment completed successfully.', orderId: id });
  } catch (error) {
    console.error('Pay order error:', error);
    res.status(500).json({ error: 'Failed to complete payment' });
  }
};
