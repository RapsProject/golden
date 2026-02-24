import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getTryouts, getSessions } from '../../../lib/api';

type TryoutItem = {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  totalQuestions?: number;
  status: 'not-started' | 'completed';
  score?: number;
};

export function TryOutListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [tryouts, setTryouts] = useState<TryoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        const [list, sessions] = await Promise.all([
          getTryouts(accessToken),
          getSessions(accessToken),
        ]);
        if (cancelled) return;
        const byTryout = new Map<string, { score: number }>();
        const sorted = (sessions ?? []).filter((s) => s.status === 'completed' && s.score != null);
        sorted.sort((a, b) => new Date(b.startTime ?? 0).getTime() - new Date(a.startTime ?? 0).getTime());
        for (const s of sorted) {
          if (!byTryout.has(s.tryoutId)) byTryout.set(s.tryoutId, { score: s.score! });
        }
        setTryouts(
          (list ?? []).map((t) => ({
            id: t.id,
            title: t.title,
            type: t.type,
            durationMinutes: t.durationMinutes,
            totalQuestions: undefined,
            status: byTryout.has(t.id) ? 'completed' : 'not-started',
            score: byTryout.get(t.id)?.score,
          }))
        );
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load tryouts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-slate-600">Loading simulations…</p>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error.toLowerCase().includes('token') ||
      error.toLowerCase().includes('unauthorized') ||
      error.toLowerCase().includes('expired');
    return (
      <div className="space-y-6">
        <p className="text-red-600">{error}</p>
        {isAuthError && (
          <p className="text-sm text-slate-600">
            Jika kamu pakai Supabase: pastikan <code className="bg-slate-100 px-1 rounded">SUPABASE_JWT_SECRET</code> di backend <code className="bg-slate-100 px-1 rounded">.env</code> sama dengan JWT Secret dari project Supabase (Project Settings → API → JWT Secret). Lalu coba{' '}
            <button
              type="button"
              className="text-brand-primary font-medium hover:underline"
              onClick={() => navigate('/login')}
            >
              login lagi
            </button>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark">
          AqTest Simulations
        </h1>
        <p className="text-slate-600 mt-1">
          Choose a mock test to begin your IUP ITB preparation.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {tryouts.map((tryout) => (
          <div
            key={tryout.id}
            className="bg-white rounded-2xl border border-brand-light shadow-sm p-5 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-brand-dark">{tryout.title}</h2>
                <p className="text-xs text-slate-500 mt-1 capitalize">{tryout.type}</p>
              </div>
              {tryout.status === 'completed' && tryout.score != null ? (
                <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-secondary/20 text-brand-dark">
                  Score: {tryout.score}
                </span>
              ) : (
                <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  Not Started
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              {tryout.totalQuestions != null && <span>{tryout.totalQuestions} questions</span>}
              <span>{tryout.durationMinutes} minutes</span>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/tryout/${tryout.id}`)}
              className="mt-auto w-full py-2.5 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
