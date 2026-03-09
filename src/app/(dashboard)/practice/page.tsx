import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyProfile, getSessions, getTryouts } from '../../../lib/api';

type PracticeItem = {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions?: number;
  status: 'not-started' | 'completed';
  score?: number;
};

function getUserTier(planName?: string): 'free' | 'premium' | 'ultimate' {
  const normalized = planName?.trim().toLowerCase();
  if (normalized === 'ultimate') return 'ultimate';
  if (normalized === 'premium') return 'premium';
  return 'free';
}

function canAccessTryout(
  tryout: { isPremium: boolean; isUltimate: boolean },
  tier: 'free' | 'premium' | 'ultimate',
) {
  if (tier === 'ultimate') return true;
  if (tier === 'premium') return !tryout.isUltimate || tryout.isPremium;
  return !tryout.isPremium && !tryout.isUltimate;
}

export function PracticeListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        const [list, sessions, profile] = await Promise.all([
          getTryouts(accessToken),
          getSessions(accessToken),
          getMyProfile(accessToken),
        ]);
        if (cancelled) return;

        const tier = getUserTier(profile?.subscriptions?.[0]?.plan?.name);
        const practiceTryouts = (list ?? [])
          .filter((t) => t.type === 'practice')
          .filter((t) => canAccessTryout(t, tier));

        const byTryout = new Map<string, { score: number }>();
        const sorted = (sessions ?? []).filter(
          (s) => s.status === 'completed' && s.score != null,
        );
        sorted.sort(
          (a, b) =>
            new Date(b.startTime ?? 0).getTime() - new Date(a.startTime ?? 0).getTime(),
        );
        for (const s of sorted) {
          if (!byTryout.has(s.tryoutId)) byTryout.set(s.tryoutId, { score: s.score! });
        }

        setItems(
          practiceTryouts.map((t) => ({
            id: t.id,
            title: t.title,
            durationMinutes: t.durationMinutes,
            totalQuestions: undefined,
            status: byTryout.has(t.id) ? 'completed' : 'not-started',
            score: byTryout.get(t.id)?.score,
          })),
        );
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load practice sets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const hasPractice = useMemo(() => items.length > 0, [items]);

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-slate-600">Loading practice sets…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark">
          Practice Sets
        </h1>
        <p className="text-slate-600 mt-1">
          Drill-specific sections at your own pace, using the same engine as simulations.
        </p>
      </div>

      {!hasPractice ? (
        <div className="rounded-2xl border border-dashed border-brand-light bg-white p-6 text-sm text-slate-600">
          No practice sets are available yet. Please check back later.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-brand-light shadow-sm p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-brand-dark">{item.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 capitalize">practice</p>
                </div>
                {item.status === 'completed' && item.score != null ? (
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-secondary/20 text-brand-dark">
                    Score: {item.score}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    Not Started
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                {item.totalQuestions != null && <span>{item.totalQuestions} questions</span>}
                <span>{item.durationMinutes} minutes</span>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/tryout/${item.id}`)}
                className="mt-auto w-full py-2.5 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

