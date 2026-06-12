import express from 'express';
import { getCart, addToCart, updateQuantity, removeFromCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update/:id', updateQuantity);
router.delete('/remove/:id', removeFromCart);

export default router;
