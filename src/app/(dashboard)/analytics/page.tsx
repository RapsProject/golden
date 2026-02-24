import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getSessions } from '../../../lib/api';

type SessionSummary = {
  id: string;
  tryoutId: string;
  score: number | null;
  status: string;
  startTime: string;
  tryout?: { id: string; title: string; type: string };
};

function formatDate(dateStr: string): string {
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

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    getSessions(accessToken)
      .then((data) => {
        if (!cancelled) {
          const completed = data
            .filter((s) => s.status === 'completed')
            .sort(
              (a, b) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );
          setSessions(completed);
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-brand-light p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="h-6 w-6 text-brand-primary" />
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
            Analytics
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Riwayat semua attempt simulation kamu. Klik untuk melihat pembahasan lengkap.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading data…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-slate-500 text-sm">
              Belum ada simulation yang diselesaikan.
            </p>
            <button
              type="button"
              onClick={() => navigate('/tryout')}
              className="py-2 px-4 rounded-lg bg-brand-primary text-white text-sm font-semibold"
            >
              Mulai Simulation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-brand-light">
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                className="w-full text-left px-5 py-4 hover:bg-brand-light/40 transition-colors flex items-center gap-4"
                onClick={() =>
                  navigate(`/tryout/${s.tryoutId}/result`, {
                    state: { sessionId: s.id },
                  })
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {s.tryout?.title ?? s.tryoutId}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(s.startTime)}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className={`text-lg font-bold ${scoreColor(s.score)}`}>
                    {s.score != null ? s.score : '—'}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
