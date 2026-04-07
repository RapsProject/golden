import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, GraduationCap, Search, AlertCircle, BarChart3, School } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getAdminUsers,
  getAdminUsersSummary,
  type AdminUserData,
  type AdminUsersSummary,
} from '../../../lib/api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function subBadge(status: string, planName?: string) {
  if (status === 'expired') return 'bg-red-100 text-red-700 border border-red-200';
  if (status === 'active') {
    const p = planName?.toLowerCase() || '';
    if (p.includes('ultimate')) return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (p.includes('premium')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-green-100 text-green-700 border border-green-200';
  }
  return 'bg-slate-100 text-slate-500 border border-slate-200';
}

export function AdminUsersPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [userList, sum] = await Promise.all([
        getAdminUsers(accessToken),
        getAdminUsersSummary(accessToken),
      ]);
      setUsers(userList);
      if (sum) setSummary(sum);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.dreamMajor ?? '').toLowerCase().includes(q) ||
      (u.schoolOrigin ?? '').toLowerCase().includes(q)
    );
  });

  const stats = summary
    ? [
        { label: 'Total Users', value: summary.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
        { label: 'Active Subscriptions', value: summary.totalActiveSubscriptions, icon: UserCheck, color: 'bg-green-50 text-green-600' },
        { label: 'Students', value: summary.totalStudents, icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
      ]
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Data semua pengguna platform</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-5 bg-white border shadow-sm rounded-2xl border-brand-light"
            >
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-dark">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 bg-red-50 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="p-4 bg-white border shadow-sm rounded-2xl border-brand-light">
        <div className="relative">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, asal sekolah, jurusan impian…"
            className="w-full py-2 pr-3 text-sm border rounded-xl border-slate-200 pl-9 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border shadow-sm rounded-2xl border-brand-light">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Nama</th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Asal Sekolah</th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Jurusan Impian</th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Role</th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Subscription</th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Bergabung</th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">Memuat…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  {search ? 'Tidak ada user yang cocok dengan pencarian.' : 'Belum ada user.'}
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const activeSub = user.subscriptions[0];
                return (
                  <tr
                    key={user.id}
                    className="transition-colors border-b border-slate-50 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-semibold text-white rounded-full bg-brand-primary shrink-0">
                          {user.fullName
                            .split(' ')
                            .slice(0, 2)
                            .map((s) => s[0]?.toUpperCase() ?? '')
                            .join('')}
                        </div>
                        <span className="font-medium text-slate-800">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[160px]">
                      {user.schoolOrigin ? (
                        <span className="inline-flex items-center gap-1 line-clamp-1">
                          <School className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                          <span className="line-clamp-1">{user.schoolOrigin}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px]">
                      <span className="line-clamp-1">{user.dreamMajor ?? <span className="text-slate-300">—</span>}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          user.role === 'admin'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {activeSub ? (
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${subBadge(activeSub.status, activeSub.plan.name)}`}
                          >
                            {activeSub.plan.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Free Plan</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/${user.id}`, { state: { user } })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-dark"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>View detail</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {!loading && (
          <div className="px-4 py-2 text-xs border-t text-slate-400 border-slate-50">
            {filtered.length} dari {users.length} user
          </div>
        )}
      </div>
    </div>
  );
}
