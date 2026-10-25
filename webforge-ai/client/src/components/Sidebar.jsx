import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, PlusSquare, LayoutTemplate, Github, Settings, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'My Projects', icon: FolderKanban },
  { to: '/projects/new', label: 'Create Project', icon: PlusSquare },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/settings?tab=github', label: 'GitHub', icon: Github },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 py-5">
      <div className="px-5 flex items-center gap-2 font-semibold mb-6">
        <Sparkles className="text-brand-600" size={20} />
        WebForge AI
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3">
        <button
          onClick={handleLogout}
          className="focus-ring w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </aside>
  );
}
