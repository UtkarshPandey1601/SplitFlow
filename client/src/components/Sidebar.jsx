import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/groups', label: '👥 Your Groups' },
  { to: '/groups/new', label: '➕ Create Group' },
  { to: '/groups/join', label: '🔗 Join Group' },
  { to: '/profile', label: '👤 Profile' }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white rounded-2xl shadow-sm border border-slate-200 h-fit p-4">
      <h2 className="font-semibold text-slate-900 mb-4 px-2">Menu</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
