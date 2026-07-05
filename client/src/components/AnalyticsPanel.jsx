import Card from './ui/Card.jsx';

const Section = ({ title, children }) => (
  <Card className="p-5">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    </div>
    {children}
  </Card>
);

const EmptyState = ({ text }) => (
  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 text-center">
    {text}
  </div>
);

export default function AnalyticsPanel({ analytics }) {
  if (!analytics) return null;

  const {
    totals,
    monthlyTrend,
    categoryBreakdown,
    groupBreakdown,
    memberBreakdown,
    paidVsOwed,
    recentActivity
  } = analytics;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Total Expenses</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">₹{Number(totals?.expenseCount || 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-1">Entries recorded</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Total Spent</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">₹{Number(totals?.spent || 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-1">Across your groups</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Your Paid</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">₹{Number(paidVsOwed?.paid || 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-1">Expenses you covered</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Your Owed</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">₹{Number(paidVsOwed?.owed || 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-1">Outstanding from your splits</p>
        </Card>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <Section title="Monthly Expense Trend">
          {monthlyTrend?.length ? (
            <div className="space-y-3">
              {monthlyTrend.map((item) => (
                <div key={item.month} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-600">{item.month}</span>
                  <span className="text-sm font-semibold text-slate-900">₹{Number(item.total).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No expense data yet" />
          )}
        </Section>

        <Section title="Expenses by Category">
          {categoryBreakdown?.length ? (
            <div className="space-y-3">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-600">{item.category}</span>
                  <span className="text-sm font-semibold text-slate-900">₹{Number(item.total).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No category data yet" />
          )}
        </Section>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <Section title="Expenses by Group">
          {groupBreakdown?.length ? (
            <div className="space-y-3">
              {groupBreakdown.map((item) => (
                <div key={item.groupName} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-600">{item.groupName}</span>
                  <span className="text-sm font-semibold text-slate-900">₹{Number(item.total).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No group data yet" />
          )}
        </Section>

        <Section title="Spending by Member">
          {memberBreakdown?.length ? (
            <div className="space-y-3">
              {memberBreakdown.map((item) => (
                <div key={item.memberName} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-600">{item.memberName}</span>
                  <span className="text-sm font-semibold text-slate-900">₹{Number(item.total).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No member data yet" />
          )}
        </Section>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <Section title="Recent Activity">
          {recentActivity?.length ? (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-xl border border-slate-200 px-3 py-3 transition hover:border-slate-300 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.groupName} • {item.userName} • {item.action}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(item.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  {item.amount > 0 && (
                    <p className="mt-2 text-sm font-medium text-slate-700">Amount: ₹{Number(item.amount).toLocaleString('en-IN')}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No recent activity yet" />
          )}
        </Section>
      </div>
    </div>
  );
}
