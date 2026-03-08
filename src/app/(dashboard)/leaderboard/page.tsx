import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getLeaderboard,
  getMyProfile,
  getTryouts,
  type LeaderboardEntry,
  type LeaderboardFilterType,
  type LeaderboardSubject,
} from '../../../lib/api';
import { LeaderboardFilters } from './LeaderboardFilters';
import { LeaderboardList, ListSkeleton } from './LeaderboardList';
import { PodiumTop3, PodiumSkeleton } from './PodiumTop3';

function formatOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

type Tryout = { id: string; title: string };

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();

  // ── Subscription: hanya Premium/Ultimate yang boleh akses ──────────────────
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  useEffect(() => {
    if (!accessToken) {
      setCanAccess(false);
      return;
    }
    let cancelled = false;
    getMyProfile(accessToken)
      .then((profile) => {
        if (cancelled) return;
        const activeSub = profile?.subscriptions?.[0];
        const planName = activeSub?.plan?.name;
        const allowed =
          activeSub?.status === 'active' &&
          (planName === 'Premium' || planName === 'Ultimate');
        setCanAccess(!!allowed);
      })
      .catch(() => {
        if (!cancelled) setCanAccess(false);
      });
    return () => { cancelled = true; };
  }, [accessToken]);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState<LeaderboardFilterType>('OVERALL');
  const [subject, setSubject] = useState<LeaderboardSubject>('MATHEMATICS');
  const [selectedTryoutId, setSelectedTryoutId] = useState<string | null>(null);

  // ── Data state ────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Tryouts (for the TRYOUT filter dropdown) ──────────────────────────────
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [tryoutsLoading, setTryoutsLoading] = useState(false);

  // Load tryout list once (used only when filterType === 'TRYOUT')
  useEffect(() => {
    if (!accessToken || canAccess !== true) return;
    let cancelled = false;
    setTryoutsLoading(true);
    getTryouts(accessToken)
      .then((data) => {
        if (!cancelled) {
          setTryouts(data.map((t) => ({ id: t.id, title: t.title })));
        }
      })
      .catch(() => {/* non-critical; show empty select */})
      .finally(() => {
        if (!cancelled) setTryoutsLoading(false);
      });
    return () => { cancelled = true; };
  }, [accessToken, canAccess]);

  // ── Fetch leaderboard whenever filters change ─────────────────────────────
  useEffect(() => {
    if (!accessToken || canAccess !== true) return;
    // Gate: don't fetch TRYOUT without a valid examId
    if (filterType === 'TRYOUT' && !selectedTryoutId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getLeaderboard(accessToken, {
      filterType,
      subject: filterType === 'SUBJECT' ? subject : undefined,
      examId: filterType === 'TRYOUT' ? selectedTryoutId ?? undefined : undefined,
    })
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load leaderboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [accessToken, canAccess, filterType, subject, selectedTryoutId]);

  // ── Filter change handlers (with reset logic) ─────────────────────────────
  function handleFilterTypeChange(f: LeaderboardFilterType) {
    if (f === filterType) return;
    setFilterType(f);
    if (f === 'OVERALL') {
      // clear secondary filters
      setSelectedTryoutId(null);
    }
    if (f === 'SUBJECT') {
      // default subject already set; no reset needed
      setSelectedTryoutId(null);
    }
    if (f === 'TRYOUT') {
      // reset to "choose" state — fetch is gated until selection is made
      setSelectedTryoutId(null);
      setEntries([]);
    }
  }

  const currentUserId = user?.id;

  const currentUserEntry: LeaderboardEntry | undefined = currentUserId
    ? entries.find((e) => e.userId === currentUserId)
    : undefined;

  const totalParticipants = entries.length;
  const top10Entry = entries.find((e) => e.rank === 10);

  let personalInsightMain: string | null = null;
  let personalInsightDetail: string | null = null;

  if (currentUserEntry && totalParticipants > 0) {
    personalInsightMain = `You are in the ${formatOrdinal(
      currentUserEntry.rank,
    )} place out of ${totalParticipants} participants on this leaderboard.`;

    if (currentUserEntry.rank <= 10) {
      personalInsightDetail =
        'Great job! You are already within the top 10 applicants for this filter.';
    } else if (top10Entry) {
      const diff = Math.max(0, top10Entry.score - currentUserEntry.score);
      if (diff > 0) {
        personalInsightDetail = `You need approximately ${diff.toFixed(
          1,
        )} more points to break into the top 10 applicants.`;
      } else {
        personalInsightDetail =
          'You are very close to the top 10 — a small score improvement could move you up.';
      }
    } else {
      personalInsightDetail =
        'Keep improving your score to climb higher on this leaderboard.';
    }
  }

  const noDataForFilter = filterType === 'TRYOUT' && !selectedTryoutId;

  if (canAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-slate-500">Memuat…</p>
      </div>
    );
  }

  const pageContent = (
    <div className="space-y-6">
      {/* Header + Filters */}
      <LeaderboardFilters
        filterType={filterType}
        subject={subject}
        selectedTryoutId={selectedTryoutId}
        tryouts={tryouts}
        tryoutsLoading={tryoutsLoading}
        onFilterTypeChange={handleFilterTypeChange}
        onSubjectChange={(s) => setSubject(s)}
        onTryoutChange={(id) => setSelectedTryoutId(id)}
      />

      {/* Prompt to select a tryout first */}
      {noDataForFilter && (
        <div className="bg-white rounded-2xl border border-brand-light p-8 text-center shadow-sm">
          <p className="text-slate-500 text-sm">
            Please select a tryout above to view the rankings.
          </p>
        </div>
      )}

      {/* Error state */}
      {!noDataForFilter && error && (
        <div className="bg-white rounded-2xl border border-red-200 p-6 text-center shadow-sm">
          <p className="text-red-500 text-sm font-medium">{error}</p>
          <p className="text-xs text-slate-400 mt-1">Please try again or change the filter.</p>
        </div>
      )}

      {/* Loading skeleton */}
      {!noDataForFilter && !error && loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-brand-light p-6 shadow-sm">
            <PodiumSkeleton />
          </div>
          <ListSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!noDataForFilter && !error && !loading && entries.length === 0 && (
        <div className="bg-white rounded-2xl border border-brand-light p-10 text-center shadow-sm">
          <p className="text-slate-500 text-base font-medium">No leaderboard data yet.</p>
          <p className="text-slate-400 text-sm mt-1">
            Complete a simulation to appear on the board!
          </p>
        </div>
      )}

      {/* Main content */}
      {!noDataForFilter && !error && !loading && entries.length > 0 && (
        <>
          {/* Personal insight for current user */}
          {currentUserEntry && personalInsightMain && (
            <div className="bg-brand-dark text-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-brand-light/80">
                  Personal insight
                </p>
                <p className="text-sm font-semibold mt-1">
                  {personalInsightMain}
                </p>
                {personalInsightDetail && (
                  <p className="text-xs mt-1 text-brand-light/90">
                    {personalInsightDetail}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-brand-light/70">
                  Your score
                </p>
                <p className="text-2xl font-semibold leading-none mt-1">
                  {currentUserEntry.score.toFixed(1)}
                </p>
              </div>
            </div>
          )}

          {/* Podium section */}
          <div className="bg-white rounded-2xl border border-brand-light px-4 pb-6 pt-4 shadow-sm">
            <PodiumTop3 entries={entries} currentUserId={currentUserId} />
          </div>

          {/* Rank 4+ list */}
          {entries.length > 3 && (
            <LeaderboardList entries={entries} currentUserId={currentUserId} />
          )}

          {/* Fewer than 4 entries: show friendly note */}
          {entries.length <= 3 && entries.length > 0 && (
            <p className="text-center text-sm text-slate-400 py-2">
              Only top {entries.length} learner{entries.length !== 1 ? 's' : ''} so far.
            </p>
          )}
        </>
      )}
    </div>
  );

  // Free user: tampilkan halaman blur + overlay notifikasi
  if (canAccess === false) {
    return (
      <div className="relative min-h-[300px]">
        <div className="blur-md pointer-events-none select-none">
          {pageContent}
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-brand-light p-6 md:p-8 shadow-xl text-center max-w-md mx-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-4">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-serif font-bold text-brand-dark mb-2">
              Halaman ini hanya dapat diakses oleh langganan Premium atau Ultimate
            </h2>
            <p className="text-slate-600 mb-6">
              Upgrade akun Anda untuk melihat peringkat dan bersaing dengan peserta lain.
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              Lihat Profile & Upgrade
            </button>
          </div>
        </div>
      </div>
    );
  }

  return pageContent;
}
