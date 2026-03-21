import { useState } from 'react';
import { Container } from '../ui/Container';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const CORRECT_ANSWER = 'A. 19';
const options = ['A. 19', 'B. 21', 'C. 23', 'D. 25'];

export function InteractiveDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  const isAnswered = selected !== null;
  const isCorrect = selected === CORRECT_ANSWER;

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelected(option);
  };

  const handleReset = () => {
    setSelected(null);
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return 'border-brand-light bg-white hover:border-brand-primary hover:bg-brand-light/60 cursor-pointer';
    }
    if (option === CORRECT_ANSWER) {
      return 'border-emerald-400 bg-emerald-50 text-emerald-900';
    }
    if (option === selected && option !== CORRECT_ANSWER) {
      return 'border-red-300 bg-red-50 text-red-900';
    }
    return 'border-brand-light bg-white opacity-50';
  };

  return (
    <section id="demo" className="py-20 md:py-24 bg-brand-light">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl text-brand-dark">
              Experience the AqTest Environment.
            </h2>
            <p className="max-w-2xl mx-auto text-base text-slate-600 md:text-lg">
              Try answering this sample question — just like in the real
              simulation dashboard. Pick an option and get instant feedback
              designed by IUP ITB students.
            </p>
          </div>

          <div className="p-6 bg-white border shadow-xl rounded-2xl border-brand-light md:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="mb-1 text-xs font-semibold tracking-wide text-brand-primary">
                  MATHEMATICS · SINGLE CHOICE
                </div>
                <div className="text-xs text-slate-500">
                  Difficulty: Medium · Language: English
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500">Time Remaining</div>
                <div className="px-3 py-1 text-sm font-semibold rounded-full bg-brand-light text-brand-dark">
                  07:32
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <p className="mb-2 text-base font-medium md:text-lg text-slate-800">
                If f(x) = 2x + 1 and g(x) = x², what is (f ∘ g)(3)?
              </p>
              <p className="text-sm italic text-slate-500">
                (Use function composition: f(g(x)) )
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
              {options.map((option) => {
                const isThisSelected = option === selected;
                const isThisCorrect = option === CORRECT_ANSWER;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={isAnswered}
                    className={[
                      'flex items-center justify-between w-full rounded-lg border px-4 py-3 text-left text-sm md:text-base transition-all duration-200',
                      getOptionStyle(option),
                      isAnswered ? 'cursor-default' : '',
                    ].join(' ')}
                  >
                    <span>{option}</span>
                    {isAnswered && isThisCorrect && (
                      <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    )}
                    {isAnswered && isThisSelected && !isThisCorrect && (
                      <XCircle size={18} className="text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Box - shown only after answering */}
            {isAnswered && (
              <div
                className={[
                  'p-4 border rounded-xl md:p-5 transition-all duration-300',
                  isCorrect
                    ? 'border-emerald-300/60 bg-emerald-50'
                    : 'border-red-300/60 bg-red-50',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={[
                      'flex items-center gap-2 text-sm font-semibold',
                      isCorrect ? 'text-emerald-600' : 'text-red-600',
                    ].join(' ')}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle size={16} />
                        Correct!
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Wrong Answer
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-primary transition-colors"
                  >
                    <RotateCcw size={14} />
                    Try Again
                  </button>
                </div>

                {!isCorrect && (
                  <p className="mb-2 text-sm md:text-base text-slate-700">
                    The correct answer is <span className="font-semibold text-emerald-700">{CORRECT_ANSWER}</span>.
                  </p>
                )}

                <p className="mb-2 text-sm md:text-base text-slate-700">
                  The function composition (f ∘ g)(3) means f(g(3)). First
                  compute g(3) = 3² = 9, then apply f: f(9) = 2 · 9 + 1 = 19.
                </p>
                <p className="text-xs md:text-sm text-slate-500">
                  Every question in SabiAcademia includes detailed reasoning like
                  this, so you don't just memorize formulas — you understand the
                  logic that IUP ITB cares about.
                </p>
              </div>
            )}

            {/* Prompt to answer - shown before answering */}
            {!isAnswered && (
              <div className="px-4 py-3 text-sm text-center rounded-lg bg-slate-50 text-slate-500">
                👆 Select an answer above to see instant feedback
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
