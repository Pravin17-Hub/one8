import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories, getBudgetCombo } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isSeller } from '../middleware/role.js';

const router = express.Router();

// Public
router.get('/categories', getCategories);
router.post('/budget-combo', getBudgetCombo);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected (Seller/Admin only)
router.post('/', authenticateToken, isSeller, createProduct);
router.put('/:id', authenticateToken, isSeller, updateProduct);
router.delete('/:id', authenticateToken, isSeller, deleteProduct);

export default router;
