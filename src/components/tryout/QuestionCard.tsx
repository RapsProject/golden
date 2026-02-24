import { Flag } from 'lucide-react';
import type { Question } from '../../lib/mockData';
import { cn } from '../../lib/utils';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | undefined;
  isMarked: boolean;
  onSelectOption: (questionId: string, optionId: string) => void;
  onToggleMark: (questionId: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  isLast: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  isMarked,
  onSelectOption,
  onToggleMark,
  onPrev,
  onNext,
  canGoPrev,
  isLast,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-brand-light shadow-sm flex flex-col h-full">
      {/* Question header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-light">
        <div>
          <span className="text-xs font-semibold text-brand-primary tracking-wide uppercase">
            {question.subject}
          </span>
          <p className="text-sm font-medium text-slate-500">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleMark(question.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
            isMarked
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
              : 'bg-slate-100 text-slate-600 hover:bg-yellow-50 hover:text-yellow-700'
          )}
          aria-label={isMarked ? 'Remove mark' : 'Mark for review'}
        >
          <Flag className="h-3.5 w-3.5" />
          {isMarked ? 'Marked' : 'Mark'}
        </button>
      </div>

      {/* Question body */}
      <div className="px-5 py-5 flex-1">
        <p className="text-base md:text-lg text-slate-900 leading-relaxed mb-6">
          {question.text}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = option.id === selectedOptionId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectOption(question.id, option.id)}
                className={cn(
                  'w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-all',
                  isSelected
                    ? 'border-brand-primary bg-brand-light shadow-sm'
                    : 'border-slate-200 bg-white hover:border-brand-secondary hover:bg-brand-light/40'
                )}
              >
                {/* Label circle */}
                <span
                  className={cn(
                    'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                    isSelected
                      ? 'bg-brand-primary text-white'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className={cn('text-sm md:text-base', isSelected ? 'text-brand-dark font-medium' : 'text-slate-700')}>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-brand-light">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={onPrev}
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          className={cn(
            'px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors',
            isLast
              ? 'bg-brand-dark text-white hover:bg-brand-primary'
              : 'bg-brand-primary text-white hover:bg-brand-dark'
          )}
        >
          {isLast ? 'Finish Review →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
