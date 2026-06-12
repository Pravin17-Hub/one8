import { query } from '../config/db.js';

export const getCart = async (req, res) => {
  try {
    const result = await query(`
      SELECT c.id as cart_id, c.quantity, p.id as product_id, p.title, p.price, p.stock_quantity,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const existing = await query('SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
    
    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].quantity + quantity;
      await query('UPDATE cart SET quantity = $1 WHERE id = $2', [newQty, existing.rows[0].id]);
    } else {
      await query('INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)', [req.user.id, productId, quantity]);
    }
    
    res.json({ message: 'Added to cart successfully' });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      await query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    } else {
      await query('UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3', [quantity, id, req.user.id]);
    }
    
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
};
