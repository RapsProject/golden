import { useCallback, useEffect, useState } from 'react';
import { Users, UserCheck, GraduationCap, Search, AlertCircle } from 'lucide-react';
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

function subBadge(status: string) {
  if (status === 'active') return 'bg-green-100 text-green-700 border border-green-200';
  if (status === 'expired') return 'bg-red-100 text-red-700 border border-red-200';
  return 'bg-slate-100 text-slate-500 border border-slate-200';
}

export function AdminUsersPage() {
  const { accessToken } = useAuth();
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
      (u.dreamMajor ?? '').toLowerCase().includes(q)
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
        <h1 className="text-2xl font-serif font-bold text-brand-dark">Users</h1>
        <p className="text-sm text-slate-500 mt-1">Data semua pengguna platform</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm flex items-center gap-4"
            >
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
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
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-brand-light p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, jurusan impian…"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nama</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jurusan Impian</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subscription</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">Memuat…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  {search ? 'Tidak ada user yang cocok dengan pencarian.' : 'Belum ada user.'}
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const activeSub = user.subscriptions[0];
                return (
                  <tr
                    key={user.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-semibold shrink-0">
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
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${subBadge(activeSub.status)}`}
                          >
                            {activeSub.plan.name}
                          </span>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {activeSub.status === 'active'
                              ? `Aktif s/d ${formatDate(activeSub.endDate)}`
                              : `Expired ${formatDate(activeSub.endDate)}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Free Plan</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {!loading && (
          <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-50">
            {filtered.length} dari {users.length} user
          </div>
        )}
      </div>
    </div>
  );
}
