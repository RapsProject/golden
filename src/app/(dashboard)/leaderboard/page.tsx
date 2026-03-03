import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getLeaderboard,
  getTryouts,
  type LeaderboardEntry,
  type LeaderboardFilterType,
  type LeaderboardSubject,
} from '../../../lib/api';
import { LeaderboardFilters } from './LeaderboardFilters';
import { LeaderboardList, ListSkeleton } from './LeaderboardList';
import { PodiumTop3, PodiumSkeleton } from './PodiumTop3';

type Tryout = { id: string; title: string };

export function LeaderboardPage() {
  const { accessToken, user } = useAuth();

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
    if (!accessToken) return;
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
  }, [accessToken]);

  // ── Fetch leaderboard whenever filters change ─────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
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
  }, [accessToken, filterType, subject, selectedTryoutId]);

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

  const noDataForFilter = filterType === 'TRYOUT' && !selectedTryoutId;

  return (
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
}
