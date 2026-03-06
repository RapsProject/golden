// import { useEffect, useMemo, useState } from 'react';
import { useEffect, useState } from "react";
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

  // const stats = useMemo(() => {
  //   if (sessions.length === 0) {
  //     return {
  //       totalAttempts: 0,
  //       avgScore: null as number | null,
  //       bestScore: null as number | null,
  //       perTryout: [] as Array<{
  //         tryoutId: string;
  //         title: string;
  //         attempts: number;
  //         bestScore: number | null;
  //         lastScore: number | null;
  //       }>,
  //     };
  //   }

  //   const byTryout = new Map<
  //     string,
  //     {
  //       tryoutId: string;
  //       title: string;
  //       attempts: number;
  //       bestScore: number | null;
  //       lastScore: number | null;
  //       lastStart: number;
  //     }
  //   >();

  //   for (const s of sessions) {
  //     const key = s.tryoutId;
  //     const existing = byTryout.get(key);
  //     const startTs = new Date(s.startTime).getTime();
  //     const title = s.tryout?.title ?? s.tryoutId;
  //     const score = s.score;

  //     if (!existing) {
  //       byTryout.set(key, {
  //         tryoutId: key,
  //         title,
  //         attempts: 1,
  //         bestScore: score,
  //         lastScore: score,
  //         lastStart: startTs,
  //       });
  //     } else {
  //       existing.attempts += 1;
  //       if (score != null && (existing.bestScore == null || score > existing.bestScore)) {
  //         existing.bestScore = score;
  //       }
  //       if (startTs > existing.lastStart) {
  //         existing.lastStart = startTs;
  //         existing.lastScore = score;
  //       }
  //     }
  //   }

  //   // Urutkan dari yang paling lama ke yang terbaru,
  //   // supaya tryout terakhir dikerjakan selalu berada di paling kanan grafik.
  //   const perTryout = Array.from(byTryout.values()).sort(
  //     (a, b) => a.lastStart - b.lastStart,
  //   );

  //   const allScores: number[] = [];
  //   let bestScore: number | null = null;
  //   for (const s of sessions) {
  //     if (s.score != null) {
  //       allScores.push(s.score);
  //       if (bestScore == null || s.score > bestScore) bestScore = s.score;
  //     }
  //   }
  //   const avgScore =
  //     allScores.length > 0
  //       ? Math.round(allScores.reduce((sum, v) => sum + v, 0) / allScores.length)
  //       : null;

  //   return {
  //     totalAttempts: sessions.length,
  //     avgScore,
  //     bestScore,
  //     perTryout: perTryout.map(({ lastStart, ...rest }) => rest),
  //   };
  // }, [sessions]);

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

      {/* Ringkasan statistik nilai */}
      {/* {!loading && !error && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-brand-light p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Attempts
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">
              {stats.totalAttempts}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-light p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Rata-rata Skor
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">
              {stats.avgScore != null ? stats.avgScore : '—'}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-light p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Skor Terbaik
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">
              {stats.bestScore != null ? stats.bestScore : '—'}
            </p>
          </div>
        </div>
      )} */}

      {/* Statistik per tryout + grafik garis */}
      {/* {!loading && !error && stats.perTryout.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-dark mb-3">
            Grafik Skor per Tryout
          </h2> */}

          {/* Grafik garis sederhana (last score per tryout) */}
          {/* <div className="w-full h-40 mb-4 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full text-brand-primary">
              <line x1="5" y1="5" x2="5" y2="95" stroke="#94a3b8" strokeWidth="0.6" />
              <line x1="5" y1="95" x2="98" y2="95" stroke="#94a3b8" strokeWidth="0.6" />

              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  // eslint-disable-next-line react/no-array-index-key
                  key={y}
                  x1="5"
                  x2="98"
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="0.3"
                />
              ))} */}

              {/* Label sumbu Y (0 dan skor maksimum) */}
              {/* {stats.bestScore != null && (
                <>
                  <text x="1" y="95" fontSize="4" fill="#64748b">
                    0
                  </text>
                  <text x="1" y="8" fontSize="4" fill="#64748b">
                    {stats.bestScore}
                  </text>
                </>
              )} */}

              {/* {stats.perTryout.length > 0 && (() => {
                const maxScore = stats.bestScore != null ? stats.bestScore : 1;
                const points = stats.perTryout.map((t, index) => {
                  const x =
                    stats.perTryout.length === 1
                      ? 50
                      : (index / (stats.perTryout.length - 1)) * 90 + 8; // padding kiri/kanan
                  const score = t.lastScore ?? t.bestScore ?? 0;
                  const ratio = maxScore ? score / maxScore : 0;
                  const y = 95 - ratio * 85; // area grafis antara 10..95
                  return { x, y, title: t.title, score };
                });

                const path =
                  points.length > 1
                    ? points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ')
                    : '';

                return (
                  <g>
                    {path && (
                      <path
                        d={path}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {points.map((p, i) => (
                      <circle
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="1.5"
                        fill="white"
                        stroke="currentColor"
                        strokeWidth="0.8"
                      >
                        <title>
                          {p.title} – Skor {p.score}
                        </title>
                      </circle>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div> */}

          {/* Label sumbu X (nama tryout) */}
          {/* <div className="flex justify-between text-[10px] md:text-[11px] text-slate-500 mb-2">
            {stats.perTryout.map((t) => (
              <span key={t.tryoutId} className="truncate max-w-[60px]">
                {t.title}
              </span>
            ))}
          </div> */}

          {/* Ringkasan angka kecil di bawah grafik */}
          {/* <div className="space-y-2 mt-2">
            {stats.perTryout.map((t) => (
              <div
                key={`${t.tryoutId}-summary`}
                className="flex items-center justify-between text-[11px] md:text-xs text-slate-600"
              >
                <div className="min-w-0">
                  <p className="truncate">{t.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {t.attempts} attempt{t.attempts > 1 ? 's' : ''} · Last{' '}
                    {t.lastScore != null ? t.lastScore : '—'} · Best{' '}
                    {t.bestScore != null ? t.bestScore : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

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
