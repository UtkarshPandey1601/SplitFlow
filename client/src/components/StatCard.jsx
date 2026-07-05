import Card from './ui/Card.jsx';

export default function StatCard({ title, value, subtitle, tone = 'slate', icon }) {
  const toneClasses = {
    slate: 'bg-slate-50 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700'
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`rounded-xl p-2.5 ${toneClasses[tone] || toneClasses.slate}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
