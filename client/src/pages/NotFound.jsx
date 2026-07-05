import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-4xl font-semibold mb-2">404</h1>
        <p className="text-slate-500 mb-4">Page not found.</p>
        <Link to="/" className="text-slate-900 underline">Go home</Link>
      </div>
    </div>
  );
}
