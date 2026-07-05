import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import Settlement from '../models/Settlement.js';
import { calculateBalances } from '../utils/calculateBalances.js';

const resolveUserId = async (value) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  const user = await User.findOne({ email: value.toLowerCase() });
  return user?._id || null;
};

const calculateShares = (amount, participants, splitType, splits = {}) => {
  const amount100 = Math.round(amount * 100);
  let shares = [];

  if (splitType === 'equal') {
    const baseShare = Math.floor(amount100 / participants.length);
    const remainder = amount100 % participants.length;
    shares = participants.map((userId, index) => ({
      userId,
      share: (baseShare + (index < remainder ? 1 : 0)) / 100
    }));
  } else if (splitType === 'percentage') {
    const totalPercentage = Object.values(splits).reduce((sum, val) => sum + (Number(val) || 0), 0);

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Percentages must sum to exactly 100%');
    }

    shares = participants.map((userId) => ({
      userId,
      share: Math.round((amount * (Number(splits[userId]) || 0) / 100) * 100) / 100
    }));
  } else if (splitType === 'manual') {
    const totalManual = Object.values(splits).reduce((sum, val) => sum + (Number(val) || 0), 0);

    if (Math.abs(totalManual - amount) > 0.01) {
      throw new Error('Manual amounts must sum exactly to total expense amount');
    }

    shares = participants.map((userId) => ({
      userId,
      share: Math.round((Number(splits[userId]) || 0) * 100) / 100
    }));
  }

  return shares;
};

const validateGroupMembership = async (group, participantIds = [], paidById, requireParticipants = true) => {
  const resolvedParticipants = await Promise.all(participantIds.map(resolveUserId));

  if (resolvedParticipants.some((participantId) => !participantId)) {
    throw new Error('All participants must be valid users');
  }

  if (requireParticipants && resolvedParticipants.length === 0) {
    throw new Error('At least one valid participant is required');
  }

  const groupMemberIds = new Set(group.members.map((member) => member.toString()));
  const invalidParticipants = resolvedParticipants.filter((participantId) => !groupMemberIds.has(participantId.toString()));

  if (invalidParticipants.length > 0) {
    throw new Error('All participants must be members of the group');
  }

  if (!paidById) {
    throw new Error('Paid by is required');
  }

  if (!groupMemberIds.has(paidById.toString())) {
    throw new Error('Paid by must be a member of the group');
  }

  if (!resolvedParticipants.some((participantId) => participantId.toString() === paidById.toString())) {
    throw new Error('Paid by must be one of the participants');
  }

  return { resolvedParticipants, finalPaidById: paidById };
};

// NEW: shared helper — recalculates balances for a group and flags any
// settlement that no longer makes sense given the current debt (e.g. an
// expense was deleted/edited and someone's paid settlement now exceeds
// what they actually owed).
const recalcAndCheckSettlements = async (groupId) => {
  const group = await Group.findById(groupId);
  const expenses = await Expense.find({ groupId }).lean();
  const settlements = await Settlement.find({ groupId }).lean();
  const memberIds = group.members.map((m) => m.toString());

  const balances = calculateBalances(memberIds, expenses, settlements);

  // A balance more negative than -0.01 means that user still owes money.
  // A balance more positive than 0.01 means they're still owed money.
  // If, after recalculating, a user who made a settlement payment now has
  // a *positive* balance (i.e. they overpaid relative to current debt),
  // flag it — doesn't block anything, just surfaces it.
  const flaggedUserIds = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => b.userId);

  const overpaidSettlements = settlements.filter((s) =>
    flaggedUserIds.includes(s.fromUser.toString())
  );

  return { balances, overpaidSettlements };
};

export const createExpense = async (req, res, next) => {
  try {
    const { groupId, title, description, amount, paidBy, participants = [], splitType = 'equal', splits = {}, category = 'General' } = req.body;

    if (!groupId || !title || !amount || !paidBy || participants.length === 0) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return res.status(400).json({ message: 'Expense amount must be greater than zero' });
    }

    if (!['equal', 'percentage', 'manual'].includes(splitType)) {
      return res.status(400).json({ message: 'Invalid split type' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const finalPaidById = (await resolveUserId(paidBy)) || req.user._id;

    let shares;
    try {
      const { resolvedParticipants, finalPaidById: validatedPaidById } = await validateGroupMembership(group, participants, finalPaidById);
      shares = calculateShares(numAmount, resolvedParticipants, splitType, splits);

      const expense = await Expense.create({
        groupId,
        title: title.trim(),
        description: description || '',
        amount: numAmount,
        paidBy: validatedPaidById,
        participants: resolvedParticipants,
        splitType,
        shares,
        category: category || 'General'
      });

      if (!group.expenses.includes(expense._id)) {
        group.expenses.push(expense._id);
        await group.save();
      }

      const populatedExpense = await Expense.findById(expense._id)
        .populate('paidBy', 'name email')
        .populate('participants', 'name email');

      res.status(201).json({ expense: populatedExpense });
      return;
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const expense = await Expense.create({
      groupId,
      title: title.trim(),
      description: description || '',
      amount: numAmount,
      paidBy: finalPaidById,
      participants: [],
      splitType,
      shares,
      category: category || 'General'
    });

    if (!group.expenses.includes(expense._id)) {
      group.expenses.push(expense._id);
      await group.save();
    }

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('participants', 'name email');

    res.status(201).json({ expense: populatedExpense });
  } catch (error) {
    next(error);
  }
};

export const getGroupExpenses = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name email')
      .populate('participants', 'name email')
      .sort({ createdAt: -1 });

    res.json({ expenses });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email')
      .populate('participants', 'name email');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const group = await Group.findById(expense.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((member) => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    res.json({ expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { title, description, amount, paidBy, participants, splitType, splits, category } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const group = await Group.findById(expense.groupId);
    const isCreator = expense.paidBy.toString() === req.user._id.toString();
    const isGroupCreator = group.createdBy.toString() === req.user._id.toString();

    if (!isCreator && !isGroupCreator) {
      return res.status(403).json({ message: 'Only expense creator or group creator can edit' });
    }

    if (title) expense.title = title.trim();
    if (description !== undefined) expense.description = description;

    if (amount) {
      const numAmount = Number(amount);
      if (numAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than zero' });
      }
      expense.amount = numAmount;
    }

    if (participants !== undefined) {
      const finalPaidBy = paidBy ? await resolveUserId(paidBy) : expense.paidBy;
      if (paidBy && !finalPaidBy) {
        return res.status(400).json({ message: 'Paid by user not found' });
      }

      try {
        const { resolvedParticipants, finalPaidById: validatedPaidById } = await validateGroupMembership(group, participants, finalPaidBy || expense.paidBy);
        expense.participants = resolvedParticipants;
        if (paidBy) expense.paidBy = validatedPaidById;
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    } else {
      try {
        const { finalPaidById: validatedPaidById } = await validateGroupMembership(group, expense.participants, paidBy ? await resolveUserId(paidBy) : expense.paidBy);
        if (paidBy) expense.paidBy = validatedPaidById;
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    if (splitType) {
      if (!['equal', 'percentage', 'manual'].includes(splitType)) {
        return res.status(400).json({ message: 'Invalid split type' });
      }
      expense.splitType = splitType;
    }

    if (category) expense.category = category;

    if (amount || participants || splitType) {
      try {
        const shares = calculateShares(expense.amount, expense.participants, expense.splitType, splits || {});
        expense.shares = shares;
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('participants', 'name email');

    // NEW: recalc balances for the whole group right away and flag any
    // settlement that now looks inconsistent because of this edit.
    const { balances, overpaidSettlements } = await recalcAndCheckSettlements(expense.groupId);

    res.json({
      expense: updatedExpense,
      message: 'Expense updated',
      balances,
      ...(overpaidSettlements.length > 0 && {
        warning: 'Some existing settlements may now exceed what is currently owed. Please review.',
        affectedSettlementIds: overpaidSettlements.map((s) => s._id)
      })
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const group = await Group.findById(expense.groupId);
    const isCreator = expense.paidBy.toString() === req.user._id.toString();
    const isGroupCreator = group.createdBy.toString() === req.user._id.toString();

    if (!isCreator && !isGroupCreator) {
      return res.status(403).json({ message: 'Only expense creator or group creator can delete' });
    }

    const groupId = expense.groupId;

    await Group.updateOne({ _id: groupId }, { $pull: { expenses: req.params.id } });
    await Expense.findByIdAndDelete(req.params.id);

    // NEW: recalc balances immediately after deletion, and flag any
    // settlement that may now be stale/overpaid as a result.
    const { balances, overpaidSettlements } = await recalcAndCheckSettlements(groupId);

    res.json({
      message: 'Expense deleted',
      balances,
      ...(overpaidSettlements.length > 0 && {
        warning: 'Some existing settlements may now exceed what is currently owed. Please review.',
        affectedSettlementIds: overpaidSettlements.map((s) => s._id)
      })
    });
  } catch (error) {
    next(error);
  }
};