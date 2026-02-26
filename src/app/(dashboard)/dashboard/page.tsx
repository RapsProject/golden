import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { getDashboardStats, type DashboardStats } from '../../../lib/api';

export function DashboardHomePage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    getDashboardStats(accessToken)
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load stats');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [accessToken]);

  const name = stats?.fullName ?? '—';
  const lastSession = stats?.lastSession ?? null;

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <section className="bg-white rounded-2xl border border-brand-light p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
              {loading ? 'Loading…' : `Hi, ${name}! Ready to conquer SabiAcademia today?`}
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-2">
              {error
                ? error
                : "Let's keep your momentum. Start a simulation and track your progress."}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate('/tryout')}
          >
            Start Simulation
          </Button>
        </div>
      </section>

      {/* Last Simulation summary */}
      <section className="bg-white rounded-2xl border border-brand-light p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-dark">Last Simulation</h2>
          <button
            type="button"
            className="text-sm font-medium text-brand-primary hover:text-brand-dark"
            onClick={() => navigate('/analytics')}
          >
            View all analytics
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !lastSession ? (
          <p className="text-sm text-slate-500">
            Belum ada simulation yang diselesaikan. Yuk mulai sekarang!
          </p>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  {lastSession.tryoutTitle}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Skor:{' '}
                  <span className="font-bold text-brand-primary text-sm">
                    {lastSession.score ?? '—'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 flex items-center gap-1.5 py-2 px-4 rounded-lg bg-brand-light text-brand-primary text-sm font-semibold hover:bg-brand-primary hover:text-white transition-colors"
                onClick={() =>
                  navigate(`/tryout/${lastSession.tryoutId}/result`, {
                    state: { sessionId: lastSession.id },
                  })
                }
              >
                <BarChart3 className="h-4 w-4" />
                View detailed analysis
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center bg-brand-light rounded-xl p-3">
                <CheckCircle2 className="h-5 w-5 text-brand-primary mb-1" />
                <div className="text-xl font-bold text-brand-primary">
                  {lastSession.correct}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Benar</div>
              </div>
              <div className="flex flex-col items-center bg-red-50 rounded-xl p-3">
                <XCircle className="h-5 w-5 text-red-500 mb-1" />
                <div className="text-xl font-bold text-red-500">{lastSession.wrong}</div>
                <div className="text-xs text-slate-500 mt-0.5">Salah</div>
              </div>
              <div className="flex flex-col items-center bg-slate-50 rounded-xl p-3">
                <MinusCircle className="h-5 w-5 text-slate-400 mb-1" />
                <div className="text-xl font-bold text-slate-400">
                  {lastSession.unanswered}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Belum dijawab</div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
