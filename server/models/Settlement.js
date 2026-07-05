import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Settlement = mongoose.model('Settlement', settlementSchema);
export default Settlement;
