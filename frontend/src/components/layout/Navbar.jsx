import { useAuth } from '../../context/AuthContext';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mobileNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    ...(isAdmin ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
  ];

  return (
    <header className="bg-surface-900/60 backdrop-blur-xl border-b border-surface-700/50 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800/60 transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Page context */}
        <div className="hidden md:block" />

        {/* User section */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-surface-500">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className={user?.role === 'admin' ? 'badge-admin' : 'badge-member'}>
            {user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 text-surface-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-700/50 p-3 space-y-1 animate-slide-up">
          {mobileNavItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
