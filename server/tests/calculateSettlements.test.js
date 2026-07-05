import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSettlements } from '../utils/calculateSettlements.js';

const getTotalTransferred = (transactions) => transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
const getTotalPositive = (balances) => balances.reduce((sum, balance) => sum + Math.max(0, Number(balance.balance || 0)), 0);

test('returns a single direct transfer for one debtor and one creditor', () => {
  const balances = [
    { userId: 'u1', name: 'Alice', balance: 100 },
    { userId: 'u2', name: 'Bob', balance: -100 }
  ];

  const transactions = calculateSettlements(balances);

  assert.deepEqual(transactions, [
    { from: 'Bob', to: 'Alice', fromUserId: 'u2', toUserId: 'u1', amount: 100 }
  ]);
  assert.equal(getTotalTransferred(transactions), getTotalPositive(balances));
});

test('filters out self, duplicate, and zero-value suggestions', () => {
  const balances = [
    { userId: 'u1', name: 'Alice', balance: 40 },
    { userId: 'u2', name: 'Bob', balance: -20 },
    { userId: 'u3', name: 'Carol', balance: -20 },
    { userId: 'u4', name: 'Diane', balance: 0 }
  ];

  const transactions = calculateSettlements(balances);

  assert.equal(transactions.length, 2);
  assert.ok(transactions.every((transaction) => transaction.amount > 0));
  assert.ok(transactions.every((transaction) => transaction.fromUserId !== transaction.toUserId));
  assert.equal(getTotalTransferred(transactions), getTotalPositive(balances));
});

test('handles equal balances and multiple debt cycles without creating invalid transfers', () => {
  const balances = [
    { userId: 'u1', name: 'Alice', balance: 50 },
    { userId: 'u2', name: 'Bob', balance: 50 },
    { userId: 'u3', name: 'Carol', balance: -50 },
    { userId: 'u4', name: 'Diane', balance: -50 }
  ];

  const transactions = calculateSettlements(balances);

  assert.equal(transactions.length, 2);
  assert.equal(getTotalTransferred(transactions), 100);
  assert.ok(transactions.every((transaction) => transaction.amount > 0));
});

test('scales to a larger group without introducing invalid payments', () => {
  const balances = [
    { userId: 'u1', name: 'Alice', balance: 100 },
    ...Array.from({ length: 10 }, (_, index) => ({
      userId: `u${index + 2}`,
      name: `Member ${index + 2}`,
      balance: -10
    }))
  ];

  const transactions = calculateSettlements(balances);

  assert.equal(transactions.length, 10);
  assert.ok(transactions.every((transaction) => transaction.fromUserId !== transaction.toUserId));
  assert.ok(transactions.every((transaction) => transaction.amount > 0));
  assert.equal(getTotalTransferred(transactions), getTotalPositive(balances));
});
