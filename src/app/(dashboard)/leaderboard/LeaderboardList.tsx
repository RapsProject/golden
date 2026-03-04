import type { LeaderboardEntry } from '../../../lib/api';

type Props = {
  entries: LeaderboardEntry[];
  currentUserId?: string;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

export function LeaderboardList({ entries, currentUserId }: Props) {
  const rest = entries.slice(3);

  if (rest.length === 0) {
    if (entries.length > 0) {
      return (
        <p className="text-center text-sm text-slate-400 py-4">
          Only top {entries.length} learner{entries.length !== 1 ? 's' : ''} so far.
        </p>
      );
    }
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto divide-y divide-brand-light">
        {rest.map((entry) => {
          const isMe = entry.userId === currentUserId;
          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                isMe
                  ? 'bg-brand-light border-l-4 border-brand-primary'
                  : 'hover:bg-slate-50'
              }`}
            >
              {/* Rank */}
              <div className="shrink-0 w-8 text-center text-sm font-bold text-slate-400">
                {entry.rank}
              </div>

              {/* Avatar */}
              <div className="shrink-0 h-9 w-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-dark overflow-hidden">
                {entry.avatarUrl ? (
                  <img src={entry.avatarUrl} alt={entry.fullName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(entry.fullName)
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-semibold truncate block ${isMe ? 'text-brand-dark' : 'text-slate-800'}`}
                  title={entry.fullName}
                >
                  {entry.fullName}
                  {isMe && (
                    <span className="ml-2 text-xs font-medium text-white bg-brand-primary rounded-full px-2 py-0.5">
                      You
                    </span>
                  )}
                </span>
              </div>

              {/* Score */}
              <div className={`shrink-0 text-base font-bold ${isMe ? 'text-brand-primary' : 'text-slate-700'}`}>
                {entry.score.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-hidden">
      <div className="divide-y divide-brand-light">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
            <div className="w-8 h-4 bg-slate-200 rounded" />
            <div className="h-9 w-9 rounded-full bg-slate-200" />
            <div className="flex-1 h-4 bg-slate-200 rounded" />
            <div className="w-12 h-4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
