import { useState } from 'react';
import Button from './ui/Button.jsx';
import Card from './ui/Card.jsx';
import SettleUpModal from './SettleUpModal.jsx';
import { formatCurrency } from '../utils/currency.js';

export default function SuggestedSettlementsCard({ suggestedTransactions, members, groupId, onSettlement }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleSettleClick = (transaction) => {
    const fromMember = members.find((member) => member._id?.toString() === transaction.fromUserId?.toString());
    const toMember = members.find((member) => member._id?.toString() === transaction.toUserId?.toString());

    setSelectedTransaction({
      from: fromMember?._id,
      to: toMember?._id,
      amount: transaction.amount
    });
    setShowModal(true);
  };

  const handleSuccess = () => {
    setSelectedTransaction(null);
    setShowModal(false);
    if (onSettlement) onSettlement();
  };

  if (!suggestedTransactions || suggestedTransactions.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Suggested Settlements</h2>
        <p className="text-sm text-slate-600 mb-4">Optimize payments to settle all debts with minimum transactions:</p>
        
        <div className="space-y-3">
          {suggestedTransactions.map((transaction, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  <span className="text-blue-700 font-bold">{transaction.from}</span>
                  <span className="mx-2 text-slate-400">→</span>
                  <span className="text-blue-700 font-bold">{transaction.to}</span>
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(transaction.amount)}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSettleClick(transaction)}
              >
                Settle
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {showModal && selectedTransaction && (
        <SettleUpModal
          groupId={groupId}
          members={members}
          fromUser={selectedTransaction.from}
          toUser={selectedTransaction.to}
          suggestedAmount={selectedTransaction.amount}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
