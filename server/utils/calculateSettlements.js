const roundToCents = (value) => Math.round(Number(value) * 100) / 100;

export const calculateSettlements = (balances = []) => {
  if (!Array.isArray(balances) || balances.length === 0) return [];
  const creditors = [];
  const debtors = [];

  balances.forEach(({ userId, balance, name }) => {
    const normalizedBalance = roundToCents(balance);

    if (normalizedBalance > 0.01) {
      creditors.push({ userId, amount: normalizedBalance, name });
    } else if (normalizedBalance < -0.01) {
      debtors.push({ userId, amount: -normalizedBalance, name });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];

    if (!creditor || !debtor) break;

    const transfer = Math.min(creditor.amount, debtor.amount);

    if (transfer > 0.01) {
      const fromUserId = debtor.userId;
      const toUserId = creditor.userId;

      // Guard against invalid or duplicate suggestions before returning them.
      if (fromUserId && toUserId && fromUserId.toString() !== toUserId.toString()) {
        transactions.push({
          from: debtor.name,
          to: creditor.name,
          fromUserId,
          toUserId,
          amount: roundToCents(transfer)
        });
      }
    }

    creditor.amount = roundToCents(creditor.amount - transfer);
    debtor.amount = roundToCents(debtor.amount - transfer);

    if (creditor.amount <= 0.01) {
      creditors.shift();
    } else {
      creditors.sort((a, b) => b.amount - a.amount);
    }

    if (debtor.amount <= 0.01) {
      debtors.shift();
    } else {
      debtors.sort((a, b) => b.amount - a.amount);
    }
  }

  return transactions.filter((transaction) => transaction.amount > 0.01);
};
