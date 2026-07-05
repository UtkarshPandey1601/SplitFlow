export const calculateBalances = (memberIds, expenses = [], settlements = []) => {
  const balances = {};
  
  // 1. Initialize balances to 0
  memberIds.forEach((id) => {
    balances[id] = 0;
  });

  // 2. Add/Subtract based on Expenses
  expenses.forEach((expense) => {
    if (!expense.paidBy || !expense.shares || expense.shares.length === 0) {
      return;
    }

    const paidById = expense.paidBy.toString();

    // Add full amount to paidBy (they are owed money)
    if (balances[paidById] !== undefined) {
      balances[paidById] += expense.amount;
    }

    // Subtract each participant's share (they owe money)
    expense.shares.forEach(({ userId, share }) => {
      const userIdStr = userId.toString();
      if (balances[userIdStr] !== undefined) {
        balances[userIdStr] -= share;
      }
    });
  });

  // 3. Add/Subtract based on Settlements (NEW LOGIC)
  settlements.forEach((settlement) => {
    if (!settlement.fromUser || !settlement.toUser || !settlement.amount) {
      return;
    }

    const fromId = settlement.fromUser.toString();
    const toId = settlement.toUser.toString();
    const amount = Number(settlement.amount);

    // fromUser gives money -> their debt decreases -> balance goes UP
    if (balances[fromId] !== undefined) {
      balances[fromId] += amount;
    }

    // toUser receives money -> they are owed less -> balance goes DOWN
    if (balances[toId] !== undefined) {
      balances[toId] -= amount;
    }
  });

  return Object.entries(balances).map(([userId, balance]) => ({
    userId,
    balance: Math.round(balance * 100) / 100
  }));
};