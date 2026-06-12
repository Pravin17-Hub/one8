import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';
// import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Allow public access for demo purposes, or protect with authenticateToken
router.post('/chat', chatWithAI);

export default router;
