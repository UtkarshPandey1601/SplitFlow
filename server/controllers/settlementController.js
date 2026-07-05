import mongoose from 'mongoose';
import Settlement from '../models/Settlement.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import { calculateBalances } from '../utils/calculateBalances.js';

const isTransactionUnsupportedError = (error) => {
  if (!error) return false;
  return (
    error.code === 251 ||
    error.code === 20 ||
    /replica set|transaction numbers|transactions are not supported|session/i.test(error.message || '')
  );
};

const createSettlementRecord = async ({ group, fromUser, toUser, amount, groupId, note, date, session }) => {
  const expensesQuery = Expense.find({ groupId }).lean();
  const settlementsQuery = Settlement.find({ groupId }).lean();

  if (session) {
    expensesQuery.session(session);
    settlementsQuery.session(session);
  }

  const [expenses, existingSettlements] = await Promise.all([expensesQuery, settlementsQuery]);

  const settlementPayload = {
    fromUser,
    toUser,
    amount: Number(amount),
    groupId,
    note: note || '',
    date: date ? new Date(date) : new Date()
  };

  if (session) {
    const [createdSettlement] = await Settlement.create([settlementPayload], { session });
    return createdSettlement;
  }

  return Settlement.create(settlementPayload);
};

export const createSettlement = async (req, res, next) => {
  try {
    const { fromUser, toUser, amount, groupId, note, date } = req.body;

    if (!fromUser || !toUser || !amount || !groupId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    if (fromUser === toUser) {
      return res.status(400).json({ message: 'Cannot settle with yourself' });
    }

    const session = await mongoose.startSession();

    try {
      let settlement;
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      const isMember = group.members.some((member) => member.toString() === req.user._id.toString());
      if (!isMember) {
        return res.status(403).json({ message: 'Not a member of this group' });
      }

      const fromUserMember = group.members.some((member) => member.toString() === fromUser);
      const toUserMember = group.members.some((member) => member.toString() === toUser);

      if (!fromUserMember || !toUserMember) {
        return res.status(400).json({ message: 'Both users must be group members' });
      }

      try {
        await session.withTransaction(async () => {
          settlement = await createSettlementRecord({
            group,
            fromUser,
            toUser,
            amount,
            groupId,
            note,
            date,
            session
          });
        });
      } catch (error) {
        if (!isTransactionUnsupportedError(error)) {
          throw error;
        }

        settlement = await createSettlementRecord({
          group,
          fromUser,
          toUser,
          amount,
          groupId,
          note,
          date
        });
      }

      const populated = await Settlement.findById(settlement._id)
        .populate('fromUser', 'name email')
        .populate('toUser', 'name email');

      res.status(201).json({ settlement: populated });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    } finally {
      await session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

export const getSettlementsByGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const settlements = await Settlement.find({ groupId })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ date: -1 });

    res.json({ settlements });
  } catch (error) {
    next(error);
  }
};