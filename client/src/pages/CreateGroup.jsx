import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { createGroup } from '../services/groupService';

export default function CreateGroup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await createGroup(data);
      toast.success('Group created!');
      navigate(`/groups/${response.data.group._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <Card className="p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Create a Group</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('name', { required: 'Group name is required' })}
                label="Group Name"
                placeholder="e.g., Roommates, Trip to Bali"
                error={errors.name?.message}
                required
              />

              <Input
                {...register('description')}
                label="Description"
                placeholder="What's this group for?"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
              >
                Create Group
              </Button>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
