import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import Loader from '../components/Loader.jsx';
import { createExpense } from '../services/expenseService.js';
import { getGroupById } from '../services/groupService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/currency.js';

export default function AddExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    defaultValues: {
      title: '',
      description: '',
      amount: '',
      paidBy: '',
      splitType: 'equal',
      category: 'Food',
      participants: {},
      percentages: {},
      manual: {}
    }
  });

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const amount = Number(watch('amount')) || 0;
  const splitType = watch('splitType');
  const participants = watch('participants');
  const percentages = watch('percentages');
  const manual = watch('manual');

  const selectedParticipants = Object.entries(participants)
    .filter(([_, selected]) => selected)
    .map(([id, _]) => id);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getGroupById(id);
        setGroup(response.data.group);
        const initialParticipants = {};
        response.data.group.members.forEach((member) => {
          initialParticipants[member._id] = true;
        });
        setValue('participants', initialParticipants);
        if (user?._id) {
          setValue('paidBy', user._id);
        }
      } catch (error) {
        toast.error('Failed to load group');
        navigate(`/groups/${id}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, setValue, navigate]);

  const getTotalPercentage = () => {
    return Object.values(percentages || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  const getTotalManual = () => {
    return Object.values(manual || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  const onSubmit = async (data) => {
    if (selectedParticipants.length === 0) {
      toast.error('Select at least one participant');
      return;
    }

    if (!data.paidBy) {
      toast.error('Select who paid');
      return;
    }

    if (!selectedParticipants.includes(data.paidBy)) {
      toast.error('The person who paid must be a participant');
      return;
    }

    if (splitType === 'percentage' && Math.abs(getTotalPercentage() - 100) > 0.01) {
      toast.error('Percentages must sum to exactly 100%');
      return;
    }

    if (splitType === 'manual' && Math.abs(getTotalManual() - amount) > 0.01) {
      toast.error('Manual amounts must sum exactly to total expense');
      return;
    }

    setSubmitting(true);
    try {
      const splits = {};
      if (splitType === 'percentage') {
        selectedParticipants.forEach((pid) => {
          splits[pid] = percentages[pid] || 0;
        });
      } else if (splitType === 'manual') {
        selectedParticipants.forEach((pid) => {
          splits[pid] = manual[pid] || 0;
        });
      }

      await createExpense({
        groupId: id,
        title: data.title,
        description: data.description,
        amount: Number(data.amount),
        paidBy: data.paidBy,
        participants: selectedParticipants,
        splitType: data.splitType,
        splits: splits,
        category: data.category
      });

      toast.success('Expense added successfully');
      navigate(`/groups/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-slate-600">Group not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <Card className="p-6 max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Add Expense</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Details</h2>
                
                <Input
                  {...register('title', { required: 'Expense name is required' })}
                  label="What is it for?"
                  placeholder="e.g., Dinner, Gas, Hotel"
                  error={errors.title?.message}
                  required
                />

                <Input
                  {...register('description')}
                  label="Description"
                  placeholder="Optional details"
                />

                <div className="grid grid-cols-2 gap-4">
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

                  <Select
                    {...register('category')}
                    label="Category"
                    options={[
                      { value: 'Food', label: '🍽️ Food' },
                      { value: 'Travel', label: '✈️ Travel' },
                      { value: 'Entertainment', label: '🎬 Entertainment' },
                      { value: 'Utilities', label: '💡 Utilities' },
                      { value: 'Other', label: '📌 Other' }
                    ]}
                  />
                </div>
              </div>

              {/* Paid By Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Who Paid?</h2>
                <Select
                  {...register('paidBy', { required: 'Select who paid' })}
                  label="Paid By"
                  options={group?.members?.map(m => ({ value: m._id, label: m.name })) || []}
                  error={errors.paidBy?.message}
                  required
                />
              </div>

              {/* Participants Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Participants</h2>
                <div className="space-y-3">
                  {group?.members?.map((member) => (
                    <label key={member._id} className="flex items-center p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <Checkbox
                        checked={participants[member._id] || false}
                        onChange={(e) => setValue('participants', { ...participants, [member._id]: e.target.checked })}
                      />
                      <span className="ml-3 text-sm text-slate-900">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Split Type Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Split Type</h2>
                <Select
                  {...register('splitType')}
                  label="How to split?"
                  options={[
                    { value: 'equal', label: 'Equal Split' },
                    { value: 'percentage', label: 'By Percentage' },
                    { value: 'manual', label: 'By Amount' }
                  ]}
                />
              </div>

              {/* Split Preview/Input Section - Show based on splitType */}
              {selectedParticipants.length > 0 && amount > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  {/* Equal Split Preview */}
                  {splitType === 'equal' && (
                    <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                      <h3 className="text-lg font-semibold text-emerald-900 mb-4">Split Preview</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-xs text-slate-500 uppercase font-medium">Total</p>
                          <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(amount)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-xs text-slate-500 uppercase font-medium">People</p>
                          <p className="text-2xl font-bold text-slate-900 mt-2">{selectedParticipants.length}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-xs text-slate-500 uppercase font-medium">Each Pays</p>
                          <p className="text-2xl font-bold text-emerald-600 mt-2">
                            {formatCurrency(amount / selectedParticipants.length)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Percentage Split Input */}
                  {splitType === 'percentage' && (
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Split by Percentage</h3>
                      <div className="space-y-4">
                        {group?.members?.map((member) => {
                          if (!selectedParticipants.includes(member._id)) return null;
                          const percentage = percentages[member._id] || 0;
                          const shareAmount = (amount * percentage) / 100;
                          return (
                            <div key={member._id} className="bg-white rounded-lg p-4 border border-blue-100">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-slate-900">{member.name}</label>
                                <span className="text-sm text-slate-600">= {formatCurrency(shareAmount)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={percentage}
                                  onChange={(e) => {
                                    const numValue = Number(e.target.value) || 0;
                                    const newPercentages = { ...percentages, [member._id]: numValue };
                                    const totalPercentage = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);
                                    

                                    if (totalPercentage <= 100.01) {
                                      setValue('percentages', newPercentages);
                                    } else {
                                      toast.error('Total cannot exceed 100%');
                                    }
                                  }}
                                  className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-slate-600 font-medium">%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-blue-200 bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">Total Percentage</span>
                          <span className={`text-lg font-bold ${Math.abs(getTotalPercentage() - 100) < 0.01 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {getTotalPercentage().toFixed(1)}% {Math.abs(getTotalPercentage() - 100) < 0.01 && '✓'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual Split Input */}
                  {splitType === 'manual' && (
                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">Split by Amount</h3>
                      <div className="space-y-4">
                        {group?.members?.map((member) => {
                          if (!selectedParticipants.includes(member._id)) return null;
                          const memberAmount = manual[member._id] || 0;
                          return (
                            <div key={member._id} className="bg-white rounded-lg p-4 border border-purple-100">
                              <label className="text-sm font-medium text-slate-900 block mb-2">{member.name}</label>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-900 font-bold text-lg">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={memberAmount}
                                  onChange={(e) => {
                                    const numValue = Number(e.target.value) || 0;
                                    const newManual = { ...manual, [member._id]: numValue };
                                    const totalManual = Object.values(newManual).reduce((sum, val) => sum + val, 0);
                                    

                                    if (totalManual <= amount + 0.01) {
                                      setValue('manual', newManual);
                                    } else {
                                      toast.error('Total cannot exceed expense amount');
                                    }
                                  }}
                                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-purple-200 bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">Total Amount</span>
                          <span className={`text-lg font-bold ${Math.abs(getTotalManual() - amount) < 0.01 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(getTotalManual())} {Math.abs(getTotalManual() - amount) < 0.01 && '✓'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-slate-600">Remaining</span>
                          <span className="text-lg font-bold text-slate-900">
                            {formatCurrency(Math.max(0, amount - getTotalManual()))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Adding Expense...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}