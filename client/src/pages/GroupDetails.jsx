import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ExpenseCard from '../components/ExpenseCard.jsx';
import BalanceCard from '../components/BalanceCard.jsx';
import GroupMembersCard from '../components/GroupMembersCard.jsx';
import SuggestedSettlementsCard from '../components/SuggestedSettlementsCard.jsx';
import SettleUpModal from '../components/SettleUpModal.jsx';
import Loader from '../components/Loader.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { getGroupById, getGroupBalances, regenerateGroupCode } from '../services/groupService.js';
import { getSuggestedSettlements, getSettlements } from '../services/settlementService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/currency.js';
import { copyTextToClipboard } from '../utils/clipboard.js';

export default function GroupDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [suggestedTransactions, setSuggestedTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettleUpModal, setShowSettleUpModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [groupRes, balancesRes, suggestedRes, settlementsRes] = await Promise.all([
          getGroupById(id),
          getGroupBalances(id),
          getSuggestedSettlements(id),
          getSettlements(id)
        ]);
        setGroup(groupRes.data.group);
        setExpenses(groupRes.data.expenses || []);
        setBalances(balancesRes.data.balances || []);
        setSuggestedTransactions(suggestedRes.data.suggestedTransactions || []);
        setSettlements(settlementsRes.data.settlements || []);
      } catch (error) {
        toast.error('Failed to load group');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCopySettlement = async (settlement) => {
    const summary = `${settlement.fromUser?.name || 'Someone'} → ${settlement.toUser?.name || 'Someone'} • ${formatCurrency(settlement.amount)}`;
    await copyTextToClipboard(summary, () => toast.success('Settlement summary copied'), (message) => toast.error(message));
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate code? Old code won\'t work.')) return;
    try {
      const response = await regenerateGroupCode(id);
      setGroup(response.data.group);
      toast.success('Code regenerated');
    } catch (error) {
      toast.error('Failed to regenerate');
    }
  };

  const handleSettlementSuccess = async () => {
    try {
      const [balancesRes, suggestedRes, settlementsRes] = await Promise.all([
        getGroupBalances(id),
        getSuggestedSettlements(id),
        getSettlements(id)
      ]);
      setBalances(balancesRes.data.balances || []);
      setSuggestedTransactions(suggestedRes.data.suggestedTransactions || []);
      setSettlements(settlementsRes.data.settlements || []);
      toast.success('Settlement recorded successfully');
    } catch (error) {
      console.error('Failed to refresh', error);
    }
  };

  const handleExpenseDeleted = async (expenseId) => {
    setExpenses((currentExpenses) => currentExpenses.filter((e) => e._id !== expenseId));

    try {
      const [balancesRes, suggestedRes, settlementsRes] = await Promise.all([
        getGroupBalances(id),
        getSuggestedSettlements(id),
        getSettlements(id)
      ]);
      setBalances(balancesRes.data.balances || []);
      setSuggestedTransactions(suggestedRes.data.suggestedTransactions || []);
      setSettlements(settlementsRes.data.settlements || []);
    } catch (error) {
      console.error('Failed to refresh after expense deletion', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 p-6">
          <Sidebar />
          <main className="flex-1 space-y-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }
  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-slate-600">Group not found</p>
        </Card>
      </div>
    );
  }

  const isCreator = group.createdBy?._id === user?._id;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        <Sidebar />
        <main className="flex-1 space-y-6">
          {/* Header */}
          <Card className="p-6 border-l-4 border-l-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
                {group.description && (
                  <p className="text-slate-600 mt-2">{group.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="lg" onClick={() => setShowSettleUpModal(true)}>
                  Settle Up
                </Button>
                <Link to={`/groups/${id}/add-expense`}>
                  <Button variant="secondary" size="lg">
                    + Add Expense
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Balances Section */}
          {balances.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Balances</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {balances.map((b) => (
                  <BalanceCard key={b.userId} name={b.name} balance={b.balance} />
                ))}
              </div>
            </Card>
          )}

          {/* Suggested Settlements */}
          {suggestedTransactions.length > 0 && (
            <SuggestedSettlementsCard
              suggestedTransactions={suggestedTransactions}
              members={group.members}
              groupId={id}
              onSettlement={handleSettlementSuccess}
            />
          )}

          {/* Settlements History */}
          {settlements.length > 0 ? (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Settlements History</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  {settlements.length} recorded
                </span>
              </div>
              <div className="space-y-3">
                {settlements.map((settlement) => (
                  <div
                    key={settlement._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        <span className="font-bold text-emerald-700">{settlement.fromUser?.name}</span>
                        <span className="mx-2 text-slate-400">→</span>
                        <span className="font-bold text-emerald-700">{settlement.toUser?.name}</span>
                      </p>
                      {settlement.note && (
                        <p className="mt-1 text-xs text-slate-500">{settlement.note}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(settlement.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-emerald-700">
                        {formatCurrency(settlement.amount)}
                      </p>
                      <Button variant="secondary" size="sm" onClick={() => handleCopySettlement(settlement)}>
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState title="No settlements yet" description="Once a payment is recorded, it will appear here." />
          )}

          {/* Members & Code */}
          <GroupMembersCard group={group} isCreator={isCreator} onRegenerate={handleRegenerate} />

          {/* Expenses Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Expenses ({expenses.length})
            </h2>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">💸</div>
                <p className="text-slate-600">No expenses yet</p>
                <p className="text-sm text-slate-500 mt-1">Add one to start splitting costs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((e) => (
                  <ExpenseCard 
                    key={e._id} 
                    expense={e} 
                    onDelete={handleExpenseDeleted}
                    groupCreatorId={group.createdBy?._id}
                  />
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Settle Up Modal */}
      {showSettleUpModal && (
        <SettleUpModal
          groupId={id}
          members={group.members}
          onClose={() => setShowSettleUpModal(false)}
          onSuccess={handleSettlementSuccess}
        />
      )}
    </div>
  );
}
