import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, GraduationCap, Search, AlertCircle, BarChart3,
  School, Crown, Filter, ArrowUpDown, ArrowUp, ArrowDown, X, ChevronDown,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getAdminUsers,
  getAdminUsersSummary,
  type AdminUserData,
  type AdminUsersSummary,
} from '../../../lib/api';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

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

/** Get the resolved subscription label for a user */
function getUserSubLabel(user: AdminUserData): string {
  const sub = user.subscriptions[0];
  return sub ? sub.plan.name : 'Free';
}

/* ─── types ───────────────────────────────────────────────────────────────── */

type SortField = 'name' | 'dreamMajor' | 'role' | 'subscription' | 'createdAt';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Nama' },
  { field: 'dreamMajor', label: 'Jurusan Impian' },
  { field: 'role', label: 'Role' },
  { field: 'subscription', label: 'Subscription' },
  { field: 'createdAt', label: 'Tanggal Bergabung' },
];

const SUB_OPTIONS = ['Semua', 'Free', 'Premium', 'Ultimate'] as const;
const ROLE_OPTIONS = ['Semua', 'student', 'admin'] as const;

/* ─── select dropdown component ───────────────────────────────────────────── */

function SelectDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative">
      <label className="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute w-3.5 h-3.5 -translate-y-1/2 left-2.5 top-1/2 text-slate-400 pointer-events-none" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-1.5 pr-7 text-xs border rounded-lg border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 appearance-none cursor-pointer ${Icon ? 'pl-7' : 'pl-2.5'}`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'Semua' ? `Semua ${label}` : opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute w-3.5 h-3.5 -translate-y-1/2 right-2 top-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

export function AdminUsersPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── search & filter state ── */
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('Semua');
  const [filterSub, setFilterSub] = useState('Semua');
  const [filterMajor, setFilterMajor] = useState('Semua');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  /* ── sort state ── */
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* ── data loading ── */
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

  /* ── derive unique dream majors for the filter dropdown ── */
  const dreamMajors = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => { if (u.dreamMajor) set.add(u.dreamMajor); });
    return ['Semua', ...Array.from(set).sort()];
  }, [users]);

  /* ── filter + sort pipeline ── */
  const processed = useMemo(() => {
    let result = [...users];

    // text search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.dreamMajor ?? '').toLowerCase().includes(q) ||
          (u.schoolOrigin ?? '').toLowerCase().includes(q),
      );
    }

    // role filter
    if (filterRole !== 'Semua') {
      result = result.filter((u) => u.role === filterRole);
    }

    // subscription filter
    if (filterSub !== 'Semua') {
      result = result.filter((u) => getUserSubLabel(u) === filterSub);
    }

    // dream major filter
    if (filterMajor !== 'Semua') {
      result = result.filter((u) => u.dreamMajor === filterMajor);
    }

    // date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((u) => new Date(u.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((u) => new Date(u.createdAt) <= to);
    }

    // sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.fullName.localeCompare(b.fullName, 'id');
          break;
        case 'dreamMajor':
          cmp = (a.dreamMajor ?? '').localeCompare(b.dreamMajor ?? '', 'id');
          break;
        case 'role':
          cmp = a.role.localeCompare(b.role);
          break;
        case 'subscription': {
          const order: Record<string, number> = { Ultimate: 3, Premium: 2, Free: 1 };
          cmp = (order[getUserSubLabel(a)] ?? 0) - (order[getUserSubLabel(b)] ?? 0);
          break;
        }
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [users, search, filterRole, filterSub, filterMajor, dateFrom, dateTo, sortField, sortDir]);

  /* ── active filter count (for badge) ── */
  const activeFilterCount =
    (filterRole !== 'Semua' ? 1 : 0) +
    (filterSub !== 'Semua' ? 1 : 0) +
    (filterMajor !== 'Semua' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const clearFilters = () => {
    setFilterRole('Semua');
    setFilterSub('Semua');
    setFilterMajor('Semua');
    setDateFrom('');
    setDateTo('');
  };

  /* ── toggle sort on column header click ── */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'createdAt' ? 'desc' : 'asc');
    }
  };

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-brand-primary" />
      : <ArrowDown className="w-3 h-3 text-brand-primary" />;
  }

  /* ── summary stats ── */
  const stats = summary
    ? [
        { label: 'Total Users', value: summary.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
        { label: 'Active Subscriptions', value: summary.totalActiveSubscriptions, icon: UserCheck, color: 'bg-green-50 text-green-600', details: summary.subscriptionDetails },
        { label: 'Students', value: summary.totalStudents, icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
      ]
    : [];

  /* ─── render ────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Data semua pengguna platform</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, color, details }) => (
            <div
              key={label}
              className="flex items-center justify-between p-5 bg-white border shadow-sm rounded-2xl border-brand-light"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-dark">{value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              </div>
              {details && details.length > 0 && (
                <div className="flex flex-col gap-1.5 items-end">
                  {details.map((d) => (
                    <span
                      key={d.name}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        d.name.toLowerCase().includes('ultimate')
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <Crown className="w-2.5 h-2.5" />
                      {d.name}: {d.count}
                    </span>
                  ))}
                </div>
              )}
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

      {/* Search + Filter bar */}
      <div className="p-4 space-y-3 bg-white border shadow-sm rounded-2xl border-brand-light">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, asal sekolah, jurusan impian…"
              className="w-full py-2 pr-3 text-sm border rounded-xl border-slate-200 pl-9 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>

          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-xl transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/30'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white rounded-full bg-brand-primary">
                {activeFilterCount}
              </span>
            )}
          </button>


        </div>

        {/* Expandable filter row */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              <SelectDropdown
                label="Role"
                value={filterRole}
                options={ROLE_OPTIONS}
                onChange={setFilterRole}
              />
              <SelectDropdown
                label="Subscription"
                value={filterSub}
                options={SUB_OPTIONS}
                onChange={setFilterSub}
              />
              <SelectDropdown
                label="Jurusan Impian"
                value={filterMajor}
                options={dreamMajors}
                onChange={setFilterMajor}
              />
              <div>
                <label className="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Dari Tanggal
                </label>
                <div className="relative">
                  <Calendar className="absolute w-3.5 h-3.5 -translate-y-1/2 left-2.5 top-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full py-1.5 pl-7 pr-2 text-xs border rounded-lg border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Sampai Tanggal
                </label>
                <div className="relative">
                  <Calendar className="absolute w-3.5 h-3.5 -translate-y-1/2 left-2.5 top-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full py-1.5 pl-7 pr-2 text-xs border rounded-lg border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold transition-colors text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
                Hapus semua filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border shadow-sm rounded-2xl border-brand-light">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th
                className="px-4 py-3 text-xs font-semibold text-left uppercase cursor-pointer select-none text-slate-500 hover:text-brand-primary"
                onClick={() => handleSort('name')}
              >
                <span className="inline-flex items-center gap-1">Nama <SortIcon field="name" /></span>
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Asal Sekolah</th>
              <th
                className="px-4 py-3 text-xs font-semibold text-left uppercase cursor-pointer select-none text-slate-500 hover:text-brand-primary"
                onClick={() => handleSort('dreamMajor')}
              >
                <span className="inline-flex items-center gap-1">Jurusan Impian <SortIcon field="dreamMajor" /></span>
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold text-left uppercase cursor-pointer select-none text-slate-500 hover:text-brand-primary"
                onClick={() => handleSort('role')}
              >
                <span className="inline-flex items-center gap-1">Role <SortIcon field="role" /></span>
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold text-left uppercase cursor-pointer select-none text-slate-500 hover:text-brand-primary"
                onClick={() => handleSort('subscription')}
              >
                <span className="inline-flex items-center gap-1">Subscription <SortIcon field="subscription" /></span>
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold text-left uppercase cursor-pointer select-none text-slate-500 hover:text-brand-primary"
                onClick={() => handleSort('createdAt')}
              >
                <span className="inline-flex items-center gap-1">Bergabung <SortIcon field="createdAt" /></span>
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-500">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">Memuat…</td>
              </tr>
            ) : processed.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  {search || activeFilterCount > 0
                    ? 'Tidak ada user yang cocok dengan pencarian atau filter.'
                    : 'Belum ada user.'}
                </td>
              </tr>
            ) : (
              processed.map((user) => {
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
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${subBadge('active', 'Free')}`}
                        >
                          Free
                        </span>
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
            {processed.length} dari {users.length} user
          </div>
        )}
      </div>
    </div>
  );
}
