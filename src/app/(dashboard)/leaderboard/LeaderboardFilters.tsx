import type { LeaderboardFilterType, LeaderboardSubject } from '../../../lib/api';
import { DREAM_MAJORS } from '../../../lib/constants';

type Tryout = {
  id: string;
  title: string;
};

type Props = {
  filterType: LeaderboardFilterType;
  subject: LeaderboardSubject;
  selectedTryoutId: string | null;
  tryouts: Tryout[];
  tryoutsLoading: boolean;
  selectedDreamMajor: string | null;
  onFilterTypeChange: (f: LeaderboardFilterType) => void;
  onSubjectChange: (s: LeaderboardSubject) => void;
  onTryoutChange: (id: string) => void;
  onDreamMajorChange: (major: string) => void;
};

const FILTER_TABS: { label: string; value: LeaderboardFilterType }[] = [
  { label: 'Overall Average', value: 'OVERALL' },
  { label: 'By Subject', value: 'SUBJECT' },
  { label: 'Specific Tryout', value: 'TRYOUT' },
  { label: 'By Dream Major', value: 'DREAM_MAJOR' },
];

export function LeaderboardFilters({
  filterType,
  subject,
  selectedTryoutId,
  tryouts,
  tryoutsLoading,
  selectedDreamMajor,
  onFilterTypeChange,
  onSubjectChange,
  onTryoutChange,
  onDreamMajorChange,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-brand-light p-5 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
          SabiAcademia Top Leaderboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          See how you rank among fellow learners. Climb to the top!
        </p>
      </div>

      {/* Primary filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilterTypeChange(value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
              filterType === value
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-brand-light text-brand-dark hover:bg-brand-secondary/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Secondary filter: subject */}
      {filterType === 'SUBJECT' && (
        <div className="flex gap-2">
          {(['MATHEMATICS', 'PHYSICS'] as LeaderboardSubject[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSubjectChange(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                subject === s
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-brand-light bg-white text-slate-700 hover:border-brand-primary'
              }`}
            >
              {s === 'MATHEMATICS' ? 'Mathematics' : 'Physics'}
            </button>
          ))}
        </div>
      )}

      {/* Secondary filter: tryout select */}
      {filterType === 'TRYOUT' && (
        <div className="max-w-sm">
          <label htmlFor="tryout-select" className="block text-xs font-medium text-slate-500 mb-1">
            Select Tryout
          </label>
          {tryoutsLoading ? (
            <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
          ) : (
            <select
              id="tryout-select"
              value={selectedTryoutId ?? ''}
              onChange={(e) => {
                if (e.target.value) onTryoutChange(e.target.value);
              }}
              className="w-full border border-brand-light rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">— Choose a tryout —</option>
              {tryouts.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Secondary filter: dream major select */}
      {filterType === 'DREAM_MAJOR' && (
        <div className="max-w-sm">
          <label htmlFor="dream-major-select" className="block text-xs font-medium text-slate-500 mb-1">
            Pilih Jurusan Impian IUP ITB
          </label>
          <select
            id="dream-major-select"
            value={selectedDreamMajor ?? ''}
            onChange={(e) => {
              if (e.target.value) onDreamMajorChange(e.target.value);
            }}
            className="w-full border border-brand-light rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">— Pilih Jurusan Impian —</option>
            {DREAM_MAJORS.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
