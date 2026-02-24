import type { Question } from '../../lib/mockData';
import { cn } from '../../lib/utils';

interface NavigationPaletteProps {
  questions: Question[];
  answers: Record<string, string>;
  markedQuestions: string[];
  currentIndex: number;
  onJump: (index: number) => void;
}

export function NavigationPalette({
  questions,
  answers,
  markedQuestions,
  currentIndex,
  onJump,
}: NavigationPaletteProps) {
  return (
    <aside className="bg-white rounded-2xl border border-brand-light p-4 h-fit">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Question Navigator
      </h3>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((q, i) => {
          const isActive = i === currentIndex;
          const isAnswered = Boolean(answers[q.id]);
          const isMarked = markedQuestions.includes(q.id);

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(i)}
              className={cn(
                'h-9 w-full rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/40',
                isActive
                  ? 'bg-brand-primary text-white shadow-md scale-105'
                  : isMarked
                  ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                  : isAnswered
                  ? 'bg-brand-secondary text-white hover:bg-brand-primary'
                  : 'bg-slate-100 text-slate-600 hover:bg-brand-light'
              )}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-brand-primary" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-brand-secondary" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-yellow-400" />
          <span>Marked for review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-slate-200" />
          <span>Unanswered</span>
        </div>
      </div>
    </aside>
  );
}
