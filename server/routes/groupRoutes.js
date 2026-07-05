import express from 'express';
import { 
  createGroup, deleteGroup, getDashboardAnalytics, getGroupById, getGroups, updateGroup, 
  getGroupBalances, joinGroupByCode, regenerateGroupCode 
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';
import { calculateBalances } from '../utils/calculateBalances.js';
import { calculateSettlements } from '../utils/calculateSettlements.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import Group from '../models/Group.js';

const router = express.Router();

// Public endpoints
router.post('/', protect, createGroup);
router.get('/', protect, getGroups);

// Special routes BEFORE :id parameter
router.post('/join/code', protect, joinGroupByCode);
router.get('/analytics', protect, getDashboardAnalytics);

// ID-based routes
router.get('/:id', protect, getGroupById);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);
router.put('/:id/regenerate-code', protect, regenerateGroupCode);
router.get('/:id/balances', protect, getGroupBalances);

// Get suggested settlements for a group
router.get('/:id/settlements/suggested', protect, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', '_id name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((m) => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const expenses = await Expense.find({ groupId: req.params.id }).lean();

    // FIX: must include existing settlements, otherwise already-paid debts
    // keep showing up as "suggested" transactions.
    const settlements = await Settlement.find({ groupId: req.params.id }).lean();

    const memberIds = group.members.map((m) => m._id.toString());
    const balances = calculateBalances(memberIds, expenses, settlements);

    const enrichedBalances = balances.map((balance) => {
      const member = group.members.find((m) => m._id.toString() === balance.userId);
      return { 
        userId: balance.userId, 
        balance: balance.balance, 
        name: member?.name || 'Unknown', 
        email: member?.email || '' 
      };
    });

    const suggestedTransactions = calculateSettlements(enrichedBalances);

    res.json({ suggestedTransactions, balances: enrichedBalances });
  } catch (error) {
    next(error);
  }
});

export default router;