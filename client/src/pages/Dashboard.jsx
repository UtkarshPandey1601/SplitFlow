import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import GroupCard from '../components/GroupCard';
import StatCard from '../components/StatCard';
import AnalyticsPanel from '../components/AnalyticsPanel';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { getDashboardAnalytics, getGroups } from '../services/groupService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [groupsResponse, analyticsResponse] = await Promise.all([
          getGroups(),
          getDashboardAnalytics()
        ]);
        setGroups(groupsResponse.data.groups || []);
        setAnalytics(analyticsResponse.data.analytics || null);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summary = analytics?.summary || {};
  const totals = analytics?.totals || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total Groups" value={groups.length} subtitle="You're a member" tone="slate" icon={<span className="text-lg">👥</span>} />
            <StatCard title="Total Expenses" value={totals.expenseCount || 0} subtitle="Across your groups" tone="blue" icon={<span className="text-lg">💸</span>} />
            <StatCard title="You Owe" value={formatCurrency(summary.youOwe || 0)} subtitle="Outstanding balance" tone="rose" icon={<span className="text-lg">⬇️</span>} />
            <StatCard title="You Are Owed" value={formatCurrency(summary.youAreOwed || 0)} subtitle="Money coming in" tone="emerald" icon={<span className="text-lg">⬆️</span>} />
            <StatCard title="Net Balance" value={formatCurrency(summary.netBalance || 0)} subtitle="Current standing" tone="amber" icon={<span className="text-lg">⚖️</span>} />
          </div>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard Analytics</h2>
                <p className="text-sm text-slate-500">A clean snapshot of your spending and balances.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {user?.name || 'Welcome'}
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <AnalyticsPanel analytics={analytics} />
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Groups</h2>
                <p className="text-sm text-slate-500">Jump back into any group you belong to.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/groups/new">
                  <Button variant="primary" size="md">Create Group</Button>
                </Link>
                <Link to="/groups/join">
                  <Button variant="secondary" size="md">Join Group</Button>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : groups.length === 0 ? (
              <EmptyState title="No groups yet" description="Create or join a group to start tracking expenses and settlements." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {groups.map((group) => (
                  <GroupCard key={group._id} group={group} />
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
