import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import GroupCard from '../components/GroupCard.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { getGroups } from '../services/groupService.js';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await getGroups();
        setGroups(response.data.groups || []);
      } catch (error) {
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Your Groups</h1>
                <p className="mt-1 text-sm text-slate-500">A focused view of the circles you’re part of.</p>
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
          </Card>

          <Card className="p-6">
            {loading ? (
              <Loader />
            ) : groups.length === 0 ? (
              <EmptyState
                title="No groups yet"
                description="Create a new group or join one with a code to get started."
              />
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
