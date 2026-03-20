import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, ChevronRight, Clock, Lock } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { getMyProfile, getSessions } from "../../../lib/api";

type SessionSummary = {
  id: string;
  tryoutId: string;
  score: number | null;
  status: string;
  startTime: string;
  tryout?: { id: string; title: string; type: string };
};

type ChartPoint = {
  idx: number;
  label: string;
  fullTitle: string;
  score: number;
  date: string;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function scoreColor(score: number | null): string {
  if (score == null) return "text-slate-400";
  if (score >= 70) return "text-brand-primary";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

function truncateLabel(title: string, maxLen = 14): string {
  return title.length > maxLen ? `${title.slice(0, maxLen)}…` : title;
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: readonly { payload: ChartPoint }[];
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="bg-white border border-brand-light rounded-xl shadow-lg px-4 py-3 text-sm max-w-[260px]">
      <p className="font-semibold text-brand-dark break-words">
        {point.fullTitle}
      </p>
      <p className="text-slate-500 text-xs mt-0.5">{point.date}</p>
      <p className="mt-1.5 text-brand-primary font-bold text-base">
        Nilai: {point.score}
        <span className="text-slate-400 font-normal text-xs"> / 100</span>
      </p>
    </div>
  );
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canAccess, setCanAccess] = useState<boolean | null>(null);

  // Cek subscription: hanya Premium/Ultimate yang boleh akses
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
          activeSub?.status === "active" &&
          (planName === "Premium" || planName === "Ultimate");
        setCanAccess(!!allowed);
      })
      .catch(() => {
        if (!cancelled) setCanAccess(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || canAccess !== true) return;
    let cancelled = false;
    getSessions(accessToken)
      .then((data) => {
        if (!cancelled) {
          const completed = data
            .filter((s) => s.status === "completed")
            .sort(
              (a, b) =>
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime(),
            );
          setSessions(completed);
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load analytics");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, canAccess]);

  // Statistik ringkasan
  const stats = useMemo(() => {
    const scored = sessions.filter((s) => s.score != null);
    if (scored.length === 0)
      return {
        totalAttempts: sessions.length,
        avgScore: null,
        bestScore: null,
      };
    const allScores = scored.map((s) => s.score as number);
    const raw = allScores.reduce((sum, v) => sum + v, 0) / allScores.length;
    const avgScore = Math.round(raw * 100) / 100;
    const bestScore = Math.max(...allScores);
    return { totalAttempts: sessions.length, avgScore, bestScore };
  }, [sessions]);

  // Data untuk grafik — setiap sesi diurutkan dari terlama ke terbaru
  const chartData = useMemo<ChartPoint[]>(() => {
    return [...sessions]
      .filter((s) => s.score != null)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .map((s, i) => ({
        idx: i,
        label: truncateLabel(s.tryout?.title ?? s.tryoutId),
        fullTitle: s.tryout?.title ?? s.tryoutId,
        score: s.score as number,
        date: formatShortDate(s.startTime),
      }));
  }, [sessions]);

  if (canAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-slate-500">Memuat…</p>
      </div>
    );
  }

  const pageContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-brand-light p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="h-6 w-6 text-brand-primary" />
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
            Analytics
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Riwayat semua attempt simulation kamu. Klik untuk melihat pembahasan
          lengkap.
        </p>
      </div>

      {/* Stat cards */}
      {!loading && !error && sessions.length > 0 && (
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
              Rata-rata Nilai
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">
              {stats.avgScore != null ? stats.avgScore : "—"}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-light p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Nilai Terbaik
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">
              {stats.bestScore != null ? stats.bestScore : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Grafik progress nilai */}
      {!loading && !error && chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-light p-5 md:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-dark mb-4">
            Grafik Progress Nilai
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="idx"
                type="number"
                domain={[-0.2, chartData.length - 1]}
                ticks={chartData.map((_, i) => i)}
                tickFormatter={(val: number) => chartData[val]?.label ?? ""}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={CustomTooltip as any}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#16a34a",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: "#16a34a",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daftar sesi */}
      <div className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Loading data…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-slate-500 text-sm">
              Belum ada simulation yang diselesaikan.
            </p>
            <button
              type="button"
              onClick={() => navigate("/tryout")}
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
                    {s.score != null ? s.score : "—"}
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
              Halaman ini hanya dapat diakses oleh langganan Premium atau
              Ultimate
            </h2>
            <p className="text-slate-600 mb-6">
              Upgrade akun Anda untuk melihat riwayat attempt dan statistik
              lengkap.
            </p>
            <button
              type="button"
              onClick={() => navigate("/profile")}
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
