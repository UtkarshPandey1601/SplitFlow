import express from 'express';
import { createSettlement, getSettlementsByGroup } from '../controllers/settlementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSettlement);
router.get('/:groupId', protect, getSettlementsByGroup);

export default router;
