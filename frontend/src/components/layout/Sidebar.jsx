import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    ...(isAdmin ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
  ];

  return (
    <aside
      className={`hidden md:flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } bg-surface-900/80 backdrop-blur-xl border-r border-surface-700/50 transition-all duration-300 relative`}
    >
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-5 py-6 border-b border-surface-700/50`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 flex-shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-white leading-tight">Task Manager</h1>
            <p className="text-[10px] text-surface-500 font-medium">Team Workspace</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
              }`}
            >
              <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-surface-500 group-hover:text-white'}`} />
              {!collapsed && <span className="animate-fade-in">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-surface-700 border border-surface-600/50 rounded-full flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-600 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};

export default Sidebar;
