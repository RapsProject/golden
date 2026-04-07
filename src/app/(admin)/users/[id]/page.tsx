import { useEffect, useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { BarChart3, ChevronLeft, Clock, Mail, Phone, School, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  getAdminUserSessions,
  getAdminUsers,
  type AdminUserData,
  type UserSessionSummary,
} from '../../../../lib/api';

type LocationState = {
  user?: AdminUserData;
} | null;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function scoreColor(score: number | null): string {
  if (score == null) return 'text-slate-400';
  if (score >= 700) return 'text-brand-primary';
  if (score >= 500) return 'text-yellow-600';
  return 'text-red-600';
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

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();

  const initialUser =
    (location.state as LocationState)?.user ?? null;

  const [user, setUser] = useState<AdminUserData | null>(initialUser);
  const [sessions, setSessions] = useState<UserSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        if (!user) {
          const list = await getAdminUsers(accessToken);
          if (cancelled) return;
          const found = list.find((u) => u.id === id) ?? null;
          setUser(found);
        }

        const data = await getAdminUserSessions(accessToken, id);
        if (cancelled) return;
        const completed = data
          .filter((s) => s.status === 'completed')
          .sort(
            (a, b) =>
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
          );
        setSessions(completed);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : 'Gagal memuat analytics user',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, id, user]);

  if (!id) return <Navigate to="/admin/users" replace />;

  const initials = (user?.fullName ?? 'User')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  const activeSub = user?.subscriptions[0];

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-dark"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali ke daftar user</span>
      </button>

      <div className="flex flex-col justify-between gap-4 p-5 bg-white border shadow-sm rounded-2xl border-brand-light md:flex-row md:items-center">
        {/* Left side: Avatar + User Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center text-xl font-semibold text-white rounded-full h-14 w-14 bg-brand-primary shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-xl font-bold text-brand-dark">
                {user?.fullName ?? 'User'}
              </h1>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                <UserIcon className="w-3 h-3" />
                {user?.role ?? 'user'}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
              {user?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              )}
              {user?.email && user?.phoneNumber && <span className="text-slate-300">•</span>}
              {user?.phoneNumber && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phoneNumber}
                </span>
              )}
              {((user?.email || user?.phoneNumber) && (user?.schoolOrigin || user?.dreamMajor)) && (
                <span className="text-slate-300">•</span>
              )}
              {(user?.schoolOrigin || user?.dreamMajor) && (
                <span className="inline-flex items-center gap-1">
                  <School className="h-3.5 w-3.5 text-brand-primary" />
                  <span className="font-medium text-slate-600">
                    {user?.schoolOrigin}
                    {user?.schoolOrigin && user?.dreamMajor && ' | '}
                    {user?.dreamMajor}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Subscription & Join Date */}
        <div className="flex items-center gap-4 text-xs">
          {activeSub ? (
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold ${subBadge(activeSub.status, activeSub.plan.name)}`}>
              <span>{activeSub.plan.name}</span>
            </div>
          ) : (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-500 border border-slate-200">
              Free Plan
            </div>
          )}
          {user && (
            <div className="text-slate-400 whitespace-nowrap">
              Bergabung: {formatDate(user.createdAt)}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 bg-white border shadow-sm rounded-2xl border-brand-light">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center rounded-full h-9 w-9 bg-brand-light">
            <BarChart3 className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-brand-dark">
              Analytics Tryout
            </h2>
            <p className="text-xs text-slate-500">
              Riwayat attempt simulation yang sudah diselesaikan oleh user ini.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-sm text-slate-500">Memuat analytics…</div>
        ) : error ? (
          <div className="py-6 text-sm text-red-600">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="py-6 text-sm text-slate-500">
            User ini belum menyelesaikan simulation apa pun.
          </div>
        ) : (
          <div className="mt-3 overflow-hidden border border-brand-light rounded-2xl">
            <div className="divide-y divide-brand-light">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-4 py-3 transition-colors bg-white hover:bg-brand-light/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-slate-900">
                      {s.tryout?.title ?? s.tryoutId}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTime(s.startTime)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-lg font-bold ${scoreColor(s.score)}`}
                    >
                      {s.score != null ? s.score : '—'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Status: {s.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-50">
              {sessions.length} attempt selesai
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

