import { formatCurrency } from '../utils/currency.js';
import Card from './ui/Card.jsx';

export default function BalanceCard({ name, balance }) {
  const numericBalance = Number(balance);
  const isPositive = numericBalance > 0.01;
  const isSettled = Math.abs(numericBalance) < 0.01;
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${
          isPositive ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-700">{name}</p>
          <p className={`text-lg font-bold ${isSettled ? 'text-slate-600' : isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isSettled ? 'Settled up' : `${isPositive ? 'Gets back' : 'Owes'} ${formatCurrency(Math.abs(balance))}`}
          </p>
        </div>
      </div>
    </Card>
  );
}
