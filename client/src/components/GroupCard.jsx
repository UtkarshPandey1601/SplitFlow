import { Link } from 'react-router-dom';
import Card from './ui/Card.jsx';

export default function GroupCard({ group }) {
  return (
    <Link to={`/groups/${group._id}`} className="block">
      <Card className="p-5 hover:border-slate-300 hover:shadow-md transition">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">{group.name}</h3>
            <p className="text-sm text-slate-500 mt-2">{group.description || 'No description'}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {group.members?.length || 0} members
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
          <span>{group.expenses?.length || 0} expenses</span>
          <span className="text-slate-300">•</span>
          <span>Open group</span>
        </div>
      </Card>
    </Link>
  );
}
