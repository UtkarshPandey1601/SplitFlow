import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0.01 },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    splitType: { type: String, enum: ['equal', 'percentage', 'manual'], default: 'equal' },
    percentage: { type: Object, default: {} },
    custom: { type: Object, default: {} },
    shares: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, share: Number }],
    category: { type: String, default: 'General' }
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
