import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Card from '../components/ui/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getGroups } from '../services/groupService.js';

export default function Profile() {
  const { user } = useAuth();
  const [groupCount, setGroupCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getGroups();
        setGroupCount(response.data.groups?.length || 0);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <Card className="p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Profile</h1>

            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide">Name</p>
                  <p className="text-xl font-bold text-slate-900">{user?.name}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Email</p>
                <p className="text-lg text-slate-900 mt-1">{user?.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Groups Joined</p>
                <p className="text-lg text-slate-900 mt-1">{groupCount}</p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
