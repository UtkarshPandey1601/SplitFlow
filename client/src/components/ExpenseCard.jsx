import toast from 'react-hot-toast';
import Button from './ui/Button.jsx';
import Card from './ui/Card.jsx';
import { formatCurrency } from '../utils/currency.js';
import { deleteExpense } from '../services/expenseService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExpenseCard({ expense, onDelete, groupCreatorId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: groupId } = useParams();
  const [deleting, setDeleting] = useState(false);

  const isCreator = expense.paidBy?._id === user?._id;
  const isGroupCreator = groupCreatorId === user?._id;
  const canEditDelete = isCreator || isGroupCreator;

  const handleDelete = async () => {
    if (!window.confirm('Delete this expense permanently?')) return;
    setDeleting(true);
    try {
      await deleteExpense(expense._id);
      toast.success('Expense deleted');
      if (onDelete) onDelete(expense._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/groups/${groupId}/edit-expense/${expense._id}`);
  };

  const participants = expense.participants?.map(p => p.name).join(', ') || 'Unknown';
  const date = new Date(expense.createdAt).toLocaleDateString('en-IN');

  const splitTypeLabel = {
    equal: 'Equal',
    percentage: 'Percentage',
    manual: 'Manual'
  }[expense.splitType] || 'Equal';

  return (
    <Card className="p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-semibold text-slate-900 text-lg">{expense.title}</h3>
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              {expense.category || 'General'}
            </span>
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
              {splitTypeLabel}
            </span>
          </div>
          
          {expense.description && (
            <p className="text-sm text-slate-600 mb-2">{expense.description}</p>
          )}
          
          <div className="space-y-1 text-sm">
            <p className="text-slate-600">
              Paid by <span className="font-medium text-slate-900">{expense.paidBy?.name}</span>
            </p>
            <p className="text-slate-500">
              Split between: {participants}
            </p>
            <p className="text-slate-400 text-xs mt-2">{date}</p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-3">
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
          {canEditDelete && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleEdit}>
                Edit
              </Button>
              <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
