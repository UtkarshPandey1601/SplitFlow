import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">SplitFlow</h1>
          <p className="text-slate-600 mt-2">A calmer way to split life together</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('email', { required: 'Email is required' })}
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
          />

          <Input
            {...register('password', { required: 'Password is required' })}
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          No account?{' '}
          <Link to="/register" className="text-slate-900 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
