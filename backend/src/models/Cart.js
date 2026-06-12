import { query } from '../config/db.js';

class Cart {
  static async getItemsByUserId(userId) {
    const result = await query(
      `SELECT c.id, c.product_id, c.quantity,
              p.title, p.price, p.stock_quantity, p.status,
              (SELECT pi.image_url FROM product_images pi
               WHERE pi.product_id = p.id AND pi.is_primary = true
               LIMIT 1) AS image_url
       FROM cart c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1
       ORDER BY c.id`,
      [userId]
    );
    return result.rows;
  }

  static async findItem(userId, productId) {
    const result = await query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return result.rows[0];
  }

  static async findItemById(cartItemId, userId) {
    const result = await query(
      'SELECT * FROM cart WHERE id = $1 AND user_id = $2',
      [cartItemId, userId]
    );
    return result.rows[0];
  }

  static async addItem(userId, productId, quantity) {
    const existing = await this.findItem(userId, productId);
    if (existing) {
      const result = await query(
        `UPDATE cart SET quantity = quantity + $1
         WHERE id = $2
         RETURNING id, product_id, quantity`,
        [quantity, existing.id]
      );
      return result.rows[0];
    }

    const result = await query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING id, product_id, quantity`,
      [userId, productId, quantity]
    );
    return result.rows[0];
  }

  static async updateQuantity(cartItemId, userId, quantity) {
    const result = await query(
      `UPDATE cart SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, product_id, quantity`,
      [quantity, cartItemId, userId]
    );
    return result.rows[0];
  }

  static async removeItem(cartItemId, userId) {
    const result = await query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
      [cartItemId, userId]
    );
    return result.rows[0];
  }

  static async clearCart(userId) {
    await query('DELETE FROM cart WHERE user_id = $1', [userId]);
  }
}

export default Cart;
