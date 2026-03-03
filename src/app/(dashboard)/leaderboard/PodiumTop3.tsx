import { Crown } from 'lucide-react';
import type { LeaderboardEntry } from '../../../lib/api';

type Props = {
  entries: LeaderboardEntry[];
  currentUserId?: string;
};

type PodiumSlot = {
  entry: LeaderboardEntry | null;
  podiumRank: 1 | 2 | 3;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

const PODIUM_CONFIG: Record<
  1 | 2 | 3,
  { height: string; bg: string; textColor: string; avatarRing: string; shadow: string }
> = {
  1: {
    height: 'h-48',
    bg: 'bg-gradient-to-b from-amber-300 to-amber-500',
    textColor: 'text-amber-900',
    avatarRing: 'ring-4 ring-amber-400 ring-offset-2',
    shadow: 'shadow-amber-300/60 shadow-lg',
  },
  2: {
    height: 'h-36',
    bg: 'bg-gradient-to-b from-slate-200 to-slate-400',
    textColor: 'text-slate-700',
    avatarRing: 'ring-4 ring-slate-300 ring-offset-2',
    shadow: 'shadow-slate-300/60 shadow-md',
  },
  3: {
    height: 'h-32',
    bg: 'bg-gradient-to-b from-orange-300 to-orange-500',
    textColor: 'text-orange-900',
    avatarRing: 'ring-4 ring-orange-400 ring-offset-2',
    shadow: 'shadow-orange-300/60 shadow-md',
  },
};

function PodiumColumn({
  entry,
  podiumRank,
  isCurrentUser,
}: {
  entry: LeaderboardEntry | null;
  podiumRank: 1 | 2 | 3;
  isCurrentUser: boolean;
}) {
  const cfg = PODIUM_CONFIG[podiumRank];

  return (
    <div className="flex flex-col items-center gap-2 w-[100px] md:w-[120px]">
      {/* Avatar + name area above the block */}
      <div className="flex flex-col items-center gap-1">
        {/* Crown for rank 1 */}
        {podiumRank === 1 && (
          <Crown className="h-6 w-6 text-amber-500 mb-1 drop-shadow" />
        )}

        {entry ? (
          <>
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold bg-white ${cfg.avatarRing} ${isCurrentUser ? 'ring-brand-primary' : ''} overflow-hidden`}
            >
              {entry.avatarUrl ? (
                <img src={entry.avatarUrl} alt={entry.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-brand-dark">{getInitials(entry.fullName)}</span>
              )}
            </div>
            <span
              className={`text-xs font-semibold text-center max-w-[90px] truncate ${isCurrentUser ? 'text-brand-primary' : 'text-slate-700'}`}
              title={entry.fullName}
            >
              {entry.fullName}
              {isCurrentUser && <span className="ml-1 text-brand-primary">(You)</span>}
            </span>
            <span className="text-xs font-bold text-slate-600">{entry.score.toFixed(1)}</span>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-400 text-lg font-bold">?</span>
            </div>
            <span className="text-xs text-slate-400">—</span>
          </>
        )}
      </div>

      {/* The podium block */}
      <div
        className={`relative w-full ${cfg.height} ${cfg.bg} ${cfg.shadow} rounded-t-xl hover:scale-105 transition-transform duration-200 flex items-center justify-center cursor-default`}
      >
        <span className={`text-5xl font-black ${cfg.textColor} opacity-40 select-none`}>
          {podiumRank}
        </span>
        {isCurrentUser && (
          <div className="absolute inset-0 rounded-t-xl border-2 border-brand-primary pointer-events-none" />
        )}
      </div>
    </div>
  );
}

export function PodiumTop3({ entries, currentUserId }: Props) {
  const top3 = entries.slice(0, 3);

  // Positional layout: 2nd place left, 1st center, 3rd right
  const slots: PodiumSlot[] = [
    { entry: top3[1] ?? null, podiumRank: 2 },
    { entry: top3[0] ?? null, podiumRank: 1 },
    { entry: top3[2] ?? null, podiumRank: 3 },
  ];

  return (
    <div className="flex items-end justify-center gap-3 md:gap-6 pt-4 pb-0">
      {slots.map(({ entry, podiumRank }) => (
        <PodiumColumn
          key={podiumRank}
          entry={entry}
          podiumRank={podiumRank}
          isCurrentUser={!!entry && entry.userId === currentUserId}
        />
      ))}
    </div>
  );
}

export function PodiumSkeleton() {
  const heights = ['h-36', 'h-48', 'h-32'];
  const order = [1, 0, 2];

  return (
    <div className="flex items-end justify-center gap-3 md:gap-6 pt-4 pb-0">
      {order.map((i) => (
        <div key={i} className="flex flex-col items-center gap-2 w-[100px] md:w-[120px] animate-pulse">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="h-3 w-16 bg-slate-200 rounded" />
          <div className={`w-full ${heights[i]} bg-slate-200 rounded-t-xl`} />
        </div>
      ))}
    </div>
  );
}
