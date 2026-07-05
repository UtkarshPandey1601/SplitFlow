import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import Select from './ui/Select.jsx';
import { createSettlement } from '../services/settlementService.js';
import { formatCurrency } from '../utils/currency.js';

export default function SettleUpModal({ groupId, members, fromUser, toUser, suggestedAmount, onClose, onSuccess }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      fromUser: fromUser || '',
      toUser: toUser || '',
      amount: suggestedAmount || '',
      note: '',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const amount = watch('amount');

  useEffect(() => {
    reset({
      fromUser: fromUser || '',
      toUser: toUser || '',
      amount: suggestedAmount || '',
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
  }, [fromUser, toUser, suggestedAmount, reset]);

  const onSubmit = async (data) => {
    if (!data.fromUser || !data.toUser) {
      toast.error('Select both users');
      return;
    }

    if (data.fromUser === data.toUser) {
      toast.error('Cannot settle with yourself');
      return;
    }

    if (Number(data.amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    setSubmitting(true);
    try {
      await createSettlement({
        fromUser: data.fromUser,
        toUser: data.toUser,
        amount: Number(data.amount),
        groupId,
        note: data.note,
        date: data.date
      });

      toast.success('Settlement recorded');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record settlement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Settle Up</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            {...register('fromUser', { required: 'Select who is paying' })}
            label="From (Who pays)"
            options={members.map(m => ({ value: m._id, label: m.name }))}
            error={errors.fromUser?.message}
            required
          />

          <Select
            {...register('toUser', { required: 'Select who receives' })}
            label="To (Who receives)"
            options={members.map(m => ({ value: m._id, label: m.name }))}
            error={errors.toUser?.message}
            required
          />

          <Input
            {...register('amount', { required: 'Amount is required' })}
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            prefix="₹"
            error={errors.amount?.message}
            required
          />

          {amount && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                Settlement: {formatCurrency(Number(amount))}
              </p>
            </div>
          )}

          <Input
            {...register('note')}
            label="Note (Optional)"
            placeholder="e.g., Payment via UPI"
          />

          <Input
            {...register('date')}
            label="Date"
            type="date"
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={submitting}
              disabled={submitting}
            >
              Record Settlement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
