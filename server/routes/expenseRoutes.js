import express from 'express';
import { createExpense, deleteExpense, getExpenseById, getGroupExpenses, updateExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes BEFORE parameterized routes
router.post('/', protect, createExpense);
router.get('/group/:groupId', protect, getGroupExpenses);

// Parameterized routes AFTER specific routes
router.get('/:id', protect, getExpenseById);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

export default router;
