import { query } from '../config/db.js';

const ORDER_LIST_FIELDS = `
  o.id, o.total_amount, o.status, o.payment_status, o.created_at,
  (SELECT COUNT(*)::int FROM order_items oi WHERE oi.order_id = o.id) AS item_count
`;

class Order {
  static async findByCustomer(userId) {
    const result = await query(
      `SELECT ${ORDER_LIST_FIELDS}
       FROM orders o
       WHERE o.customer_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findByIdForCustomer(orderId, userId) {
    const orderResult = await query(
      `SELECT o.id, o.total_amount, o.status, o.payment_status, o.created_at,
              a.full_name, a.phone, a.address_line_1, a.address_line_2,
              a.city, a.state, a.postal_code, a.country
       FROM orders o
       LEFT JOIN addresses a ON a.id = o.address_id
       WHERE o.id = $1 AND o.customer_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) return null;

    const itemsResult = await query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_time,
              p.title,
              (SELECT pi.image_url FROM product_images pi
               WHERE pi.product_id = p.id AND pi.is_primary = true
               LIMIT 1) AS image_url
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    const order = orderResult.rows[0];
    return formatOrderDetail(order, itemsResult.rows);
  }
}

export const formatOrderDetail = (order, items) => ({
  id: order.id,
  total_amount: parseFloat(order.total_amount),
  status: order.status,
  payment_status: order.payment_status,
  created_at: order.created_at,
  shipping_address: order.full_name
    ? {
        full_name: order.full_name,
        phone: order.phone,
        address_line_1: order.address_line_1,
        address_line_2: order.address_line_2,
        city: order.city,
        state: order.state,
        postal_code: order.postal_code,
        country: order.country,
      }
    : null,
  items: items.map((row) => ({
    id: row.id,
    product_id: row.product_id,
    title: row.title || 'Product unavailable',
    quantity: row.quantity,
    price_at_time: parseFloat(row.price_at_time),
    line_total: parseFloat(row.price_at_time) * row.quantity,
    image_url: row.image_url,
  })),
});

export const formatOrderSummary = (row) => ({
  id: row.id,
  total_amount: parseFloat(row.total_amount),
  status: row.status,
  payment_status: row.payment_status,
  created_at: row.created_at,
  item_count: row.item_count,
});

export default Order;
