import { useState } from 'react';
import { BookOpen, Menu, Users, X, LayoutDashboard, LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard },
  { label: 'Tryouts', to: '/admin/tryouts', icon: LayoutDashboard },
  { label: 'Questions', to: '/admin/questions', icon: BookOpen },
  { label: 'Subjects', to: '/admin/subjects', icon: BookOpen },
  { label: 'Users', to: '/admin/users', icon: Users },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName =
    (authUser?.user_metadata?.full_name as string) ||
    authUser?.email?.split('@')[0] ||
    'Admin';

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase() ?? '')
    .join('');

  const Sidebar = ({ className }: { className?: string }) => (
    <aside
      className={cn(
        'h-full w-[250px] flex flex-col bg-white border-r border-brand-light',
        className,
      )}
    >
      <div className="flex items-center gap-3 px-5 py-5 text-white bg-brand-dark">
        <img src="/Logo_Putih.png" alt="SabiAdmin Logo" className="object-contain w-10 h-10" />
        <div>
          <div className="font-serif text-xl font-bold leading-none">
            Sabi<span className="text-brand-secondary">Admin</span>
          </div>
          <div className="mt-1 text-xs text-white/80">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/admin'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-light text-brand-dark'
                  : 'text-slate-700 hover:bg-brand-light/60 hover:text-brand-dark',
              )
            }
          >
            <Icon className="w-5 h-5 text-brand-primary" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-light">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full h-9 w-9 bg-brand-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate text-slate-900">{displayName}</div>
            <div className="text-xs truncate text-slate-500">{authUser?.email ?? ''}</div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="justify-center w-full mb-2"
          icon={LayoutDashboard}
          iconPosition="left"
          onClick={() => navigate('/dashboard')}
        >
          Back to Member Area
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="justify-center w-full"
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
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 overflow-auto lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="sticky top-0 z-40 bg-white border-b border-brand-light">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <img src="/Logo_Putih.png" alt="SabiAdmin Logo" className="object-contain w-8 h-8" />
              <div className="font-serif text-lg font-bold text-brand-dark">
                Sabi<span className="text-brand-primary">Admin</span>
              </div>
            </div>
            <button
              type="button"
              className="p-2 text-brand-dark"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
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
              className="absolute p-2 text-white top-4 right-4"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
