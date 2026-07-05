import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import { calculateBalances } from '../utils/calculateBalances.js';
import { generateUniqueGroupCode } from '../utils/generateGroupCode.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate('members', '_id name email').lean();
    const groupIds = groups.map((group) => group._id);

    const [expenses, settlements] = await Promise.all([
      Expense.find({ groupId: { $in: groupIds } }).populate('paidBy', '_id name').populate('participants', '_id name').lean(),
      Settlement.find({ groupId: { $in: groupIds } }).populate('fromUser', '_id name').populate('toUser', '_id name').lean()
    ]);

    const groupMap = Object.fromEntries(groups.map((group) => [group._id.toString(), group]));
    const memberIds = groups.flatMap((group) => group.members.map((member) => member._id.toString()));
    const uniqueMemberIds = Array.from(new Set(memberIds));
    const balances = calculateBalances(uniqueMemberIds, expenses, settlements);
    const currentUserBalance = balances.find((balance) => balance.userId === req.user._id.toString()) || { balance: 0 };

    const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const currentUserPaid = expenses.reduce((sum, expense) => {
      if (expense.paidBy?._id?.toString() === req.user._id.toString()) {
        return sum + Number(expense.amount || 0);
      }
      return sum;
    }, 0);
    const currentUserOwed = expenses.reduce((sum, expense) => {
      const share = expense.shares?.find((entry) => entry.userId?.toString() === req.user._id.toString())?.share || 0;
      return sum + Number(share || 0);
    }, 0);

    const monthlyTrend = Object.values(expenses.reduce((acc, expense) => {
      const monthKey = new Date(expense.createdAt).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, total: 0 };
      }
      acc[monthKey].total += Number(expense.amount || 0);
      return acc;
    }, {})).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const categoryBreakdown = Object.values(expenses.reduce((acc, expense) => {
      const category = expense.category || 'General';
      if (!acc[category]) {
        acc[category] = { category, total: 0 };
      }
      acc[category].total += Number(expense.amount || 0);
      return acc;
    }, {})).sort((a, b) => b.total - a.total);

    const groupBreakdown = Object.values(expenses.reduce((acc, expense) => {
      const groupName = groupMap[expense.groupId?.toString()]?.name || 'Unknown Group';
      if (!acc[groupName]) {
        acc[groupName] = { groupName, total: 0 };
      }
      acc[groupName].total += Number(expense.amount || 0);
      return acc;
    }, {})).sort((a, b) => b.total - a.total);

    const memberBreakdown = Object.values(expenses.reduce((acc, expense) => {
      const paidByName = expense.paidBy?.name || 'Unknown';
      if (!acc[paidByName]) {
        acc[paidByName] = { memberName: paidByName, total: 0 };
      }
      acc[paidByName].total += Number(expense.amount || 0);
      return acc;
    }, {})).sort((a, b) => b.total - a.total);

    const recentActivity = [
      ...expenses.map((expense) => ({
        id: expense._id,
        type: 'expense',
        title: expense.title,
        groupName: groupMap[expense.groupId?.toString()]?.name || 'Unknown Group',
        userName: expense.paidBy?.name || 'Someone',
        action: 'Added expense',
        amount: Number(expense.amount || 0),
        timestamp: new Date(expense.createdAt).getTime()
      })),
      ...settlements.map((settlement) => ({
        id: settlement._id,
        type: 'settlement',
        title: 'Settlement recorded',
        groupName: groupMap[settlement.groupId?.toString()]?.name || 'Unknown Group',
        userName: settlement.fromUser?.name || 'Someone',
        action: 'Recorded settlement',
        amount: Number(settlement.amount || 0),
        timestamp: new Date(settlement.date).getTime()
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);

    res.json({
      analytics: {
        totals: {
          groupsCount: groups.length,
          expenseCount: expenses.length,
          spent: totalSpent
        },
        summary: {
          youOwe: Math.max(0, -Number(currentUserBalance.balance || 0)),
          youAreOwed: Math.max(0, Number(currentUserBalance.balance || 0)),
          netBalance: Number(currentUserBalance.balance || 0)
        },
        paidVsOwed: {
          paid: currentUserPaid,
          owed: currentUserOwed
        },
        monthlyTrend,
        categoryBreakdown,
        groupBreakdown,
        memberBreakdown,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    let groupCode = '';
    let group;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      groupCode = await generateUniqueGroupCode(Group);
      try {
        group = await Group.create({
          name: name.trim(),
          description: description || '',
          createdBy: req.user._id,
          members: [req.user._id],
          expenses: [],
          groupCode
        });
        break;
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }

    if (!group) {
      return res.status(500).json({ message: 'Unable to generate a unique group code' });
    }

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({ group: populatedGroup });
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ groups });
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((m) => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const expenses = await Expense.find({ groupId: req.params.id })
      .populate('paidBy', 'name email')
      .populate('participants', 'name email')
      .sort({ createdAt: -1 });

    res.json({ group, expenses });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can update group' });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description;

    await group.save();
    
    const updatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.json({ group: updatedGroup });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete group' });
    }

    await Expense.deleteMany({ groupId: req.params.id });
    await Settlement.deleteMany({ groupId: req.params.id });
    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: 'Group deleted' });
  } catch (error) {
    next(error);
  }
};

export const joinGroupByCode = async (req, res, next) => {
  try {
    const { groupCode } = req.body;

    if (!groupCode || groupCode.trim().length === 0) {
      return res.status(400).json({ message: 'Group code is required' });
    }

    const group = await Group.findOne({ groupCode: groupCode.toUpperCase().trim() });
    if (!group) {
      return res.status(404).json({ message: 'Invalid group code' });
    }

    if (group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    group.members.push(req.user._id);
    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.json({ group: populatedGroup, message: 'Successfully joined group' });
  } catch (error) {
    next(error);
  }
};

export const regenerateGroupCode = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can regenerate code' });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        group.groupCode = await generateUniqueGroupCode(Group, group._id);
        await group.save();
        break;
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }

    const updatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.json({ group: updatedGroup, message: 'Group code regenerated' });
  } catch (error) {
    next(error);
  }
};

export const getGroupBalances = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', '_id name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((m) => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const expenses = await Expense.find({ groupId: req.params.id }).lean();
    
    // NEW: Fetch settlements
    const settlements = await Settlement.find({ groupId: req.params.id }).lean();

    const memberIds = group.members.map((m) => m._id.toString());
    
    // NEW: Pass settlements as third argument
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

    res.json({ balances: enrichedBalances });
  } catch (error) {
    next(error);
  }
};