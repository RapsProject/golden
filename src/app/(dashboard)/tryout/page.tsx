import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyProfile, getSessions, getTryouts } from '../../../lib/api';

type TryoutItem = {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  totalQuestions?: number;
  status: 'not-started' | 'completed';
  score?: number;
  isLocked?: boolean;
  lockReason?: string;
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
        const [list, sessions, profile] = await Promise.all([
          getTryouts(accessToken),
          getSessions(accessToken),
          getMyProfile(accessToken),
        ]);
        if (cancelled) return;
        const tier = getUserTier(profile?.subscriptions?.[0]?.plan?.name);
        const byTryout = new Map<string, { score: number }>();
        const sorted = (sessions ?? []).filter((s) => s.status === 'completed' && s.score != null);
        sorted.sort((a, b) => new Date(b.startTime ?? 0).getTime() - new Date(a.startTime ?? 0).getTime());
        for (const s of sorted) {
          if (!byTryout.has(s.tryoutId)) byTryout.set(s.tryoutId, { score: s.score! });
        }
        const mapped = (list ?? [])
          .filter((t) => t.type === 'simulation')
          .map((t) => {
            const locked = !canAccessTryout(t, tier);
            let lockReason = '';
            if (locked) {
              if (t.isUltimate && !t.isPremium) {
                lockReason = 'Only available for Ultimate subscription';
              } else if (t.isPremium && !t.isUltimate) {
                lockReason = 'Only available for Premium or higher subscription';
              } else {
                lockReason = 'Only available for Premium or higher subscription';
              }
            }
            return {
              id: t.id,
              title: t.title,
              type: t.type,
              durationMinutes: t.durationMinutes,
              totalQuestions: undefined,
              status: (byTryout.has(t.id) ? 'completed' : 'not-started') as 'completed' | 'not-started',
              score: byTryout.get(t.id)?.score,
              isLocked: locked,
              lockReason,
            };
          });
        // Sort: unlocked first, then locked
        mapped.sort((a, b) => (a.isLocked === b.isLocked ? 0 : a.isLocked ? 1 : -1));
        setTryouts(mapped);
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

  const hasTryouts = useMemo(() => tryouts.length > 0, [tryouts]);

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

      {!hasTryouts ? (
        <div className="rounded-2xl border border-dashed border-brand-light bg-white p-6 text-sm text-slate-600">
          No simulations are available yet. Please check back later.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {tryouts.map((tryout) => (
            <div
              key={tryout.id}
              className="bg-white rounded-2xl border border-brand-light shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden"
            >
              {tryout.isLocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[3px]">
                  <Lock className="h-8 w-8 text-slate-800 mb-2 drop-shadow-sm" />
                  <span className="text-sm font-bold text-slate-800 drop-shadow-sm">Terkunci</span>
                  <p className="text-xs text-slate-700 font-medium px-4 text-center mt-1">{tryout.lockReason}</p>
                  <button 
                    onClick={() => navigate('/subscription')}
                    className="mt-3 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-brand-dark transition-colors border border-brand-primary"
                  >
                    Upgrade
                  </button>
                </div>
              )}
              
              <div className={`flex flex-col gap-4 h-full transition-all ${tryout.isLocked ? 'blur-[5px] select-none opacity-60 pointer-events-none' : ''}`}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
