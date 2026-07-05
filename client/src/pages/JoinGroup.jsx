import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { joinGroupByCode } from '../services/groupService.js';

export default function JoinGroup() {
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupCode.trim()) {
      toast.error('Enter a group code');
      return;
    }

    setLoading(true);
    try {
      const response = await joinGroupByCode(groupCode);
      toast.success('Successfully joined!');
      navigate(`/groups/${response.data.group._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <Card className="p-8 max-w-md">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Join a Group</h1>
            <p className="text-slate-600 mb-6">Enter the 8-character code to join</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC12XYZ"
                maxLength="8"
                className="text-center text-lg font-mono"
                label="Group Code"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Joining...' : 'Join Group'}
              </Button>
            </form>

            <p className="text-sm text-slate-500 text-center mt-4">
              Ask the group creator for the code
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}
