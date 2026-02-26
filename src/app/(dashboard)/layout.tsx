import { useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Clock,
  Home,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useMemo(
    () => ({
      name:
        (authUser?.user_metadata?.full_name as string) ||
        authUser?.email?.split('@')[0] ||
        'User',
      email: authUser?.email ?? '',
    }),
    [authUser]
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const items: NavItem[] = useMemo(
    () => [
      { label: 'Dashboard', to: '/dashboard', icon: Home },
      { label: 'Simulation', to: '/tryout', icon: Clock },
      { label: 'Analytics', to: '/analytics', icon: BarChart3 },
      { label: 'Practice (Coming Soon)', to: '/coming-soon', icon: BookOpen },
      { label: 'Profile', to: '/profile', icon: User },
    ],
    []
  );

  const Sidebar = ({ className }: { className?: string }) => (
    <aside
      className={cn(
        'h-full w-[250px] flex flex-col bg-white border-r border-brand-light',
        className
      )}
    >
      <div className="bg-brand-dark text-white px-5 py-5">
        <div className="text-xl font-bold font-serif">
          Sabi<span className="text-brand-secondary">Academia</span>
        </div>
        <div className="text-xs text-white/80 mt-1">Member Area</div>
      </div>

      <nav className="p-3 space-y-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-light text-brand-dark'
                  : 'text-slate-700 hover:bg-brand-light/60 hover:text-brand-dark'
              )
            }
            end={to === '/dashboard'}
          >
            <Icon className="h-5 w-5 text-brand-primary" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-brand-light">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-semibold">
            {user.name
              .split(' ')
              .slice(0, 2)
              .map((s) => s[0])
              .join('')}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          icon={LogOut}
          iconPosition="left"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Desktop */}
      <div className="hidden md:flex">
        <div className="h-screen sticky top-0">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="sticky top-0 z-40 bg-white border-b border-brand-light">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-lg font-bold font-serif text-brand-dark">
              Sabi<span className="text-brand-primary">Academia</span>
            </div>
            <button
              type="button"
              className="p-2 text-brand-dark"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <main className="p-4">
          <Outlet />
        </main>

        {mobileOpen && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu overlay"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute top-0 left-0 h-full">
              <Sidebar />
            </div>
            <button
              type="button"
              className="absolute top-4 right-4 text-white p-2"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

