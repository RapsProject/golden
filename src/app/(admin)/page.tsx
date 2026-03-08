import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, UserCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminUsersSummary, type AdminUsersSummary } from '../../lib/api';

export function AdminOverviewPage() {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<AdminUsersSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    getAdminUsersSummary(accessToken)
      .then((data) => { if (data) setSummary(data); })
      .catch(() => {/* handled silently */})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const stats = [
    {
      label: 'Total Users',
      value: loading ? '—' : summary?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Subscriptions',
      value: loading ? '—' : summary?.totalActiveSubscriptions ?? 0,
      icon: UserCheck,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Students',
      value: loading ? '—' : summary?.totalStudents ?? 0,
      icon: GraduationCap,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Admins',
      value: loading ? '—' : summary?.totalAdmins ?? 0,
      icon: BookOpen,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-brand-dark">Admin Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ringkasan data platform SabiAcademia.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`p-2.5 rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-dark">{String(value)}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-brand-light p-6 shadow-sm">
        <h2 className="text-base font-semibold text-brand-dark mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-3 mt-3">
          <Link
            to="/admin/tryouts"
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Kelola Tryout
          </Link>
          <Link
            to="/admin/questions"
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Kelola Questions
          </Link>
          <Link
            to="/admin/subjects"
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Kelola Subjects & Topics
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Lihat Users
          </Link>
        </div>
      </div>
    </div>
  );
}
