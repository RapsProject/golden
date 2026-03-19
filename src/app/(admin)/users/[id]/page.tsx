import { useEffect, useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { BarChart3, ChevronLeft, Clock, Mail, Phone, GraduationCap, School, User as UserIcon } from 'lucide-react';
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
        <ChevronLeft className="h-4 w-4" />
        <span>Kembali ke daftar user</span>
      </button>

      <div className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-primary text-white flex items-center justify-center text-lg font-semibold">
            {initials}
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-serif font-bold text-brand-dark">
              {user?.fullName ?? 'User'}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
              {user?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </span>
              )}
              {user?.phoneNumber && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {user.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-xs">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <UserIcon className="h-3 w-3" />
            <span className="font-semibold uppercase tracking-wide">
              {user?.role ?? 'user'}
            </span>
          </div>
          {user?.schoolOrigin && (
            <div className="inline-flex items-center gap-1 text-slate-600">
              <School className="h-3 w-3 text-brand-primary" />
              <span>{user.schoolOrigin}</span>
            </div>
          )}
          {user?.dreamMajor && (
            <div className="inline-flex items-center gap-1 text-slate-600">
              <GraduationCap className="h-3 w-3 text-brand-primary" />
              <span>{user.dreamMajor}</span>
            </div>
          )}
          {activeSub && (
            <div className="text-xs text-slate-500">
              <div className="mb-0.5 font-semibold text-slate-600">Subscription</div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                <span className="text-slate-700">{activeSub.plan.name}</span>
                <span className="text-slate-400">
                  ({activeSub.status === 'active' ? 'Aktif' : 'Expired'} s/d{' '}
                  {formatDate(activeSub.endDate)})
                </span>
              </div>
            </div>
          )}
          {user && (
            <div className="text-xs text-slate-400">
              Bergabung: {formatDate(user.createdAt)}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-full bg-brand-light flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-brand-primary" />
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
          <div className="mt-3 border border-brand-light rounded-2xl overflow-hidden">
            <div className="divide-y divide-brand-light">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="px-4 py-3 flex items-center gap-4 bg-white hover:bg-brand-light/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {s.tryout?.title ?? s.tryoutId}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateTime(s.startTime)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
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

