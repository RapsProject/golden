import { Container } from '../ui/Container';

const options = ['A. 2', 'B. 3', 'C. 4', 'D. 5'];

export function InteractiveDemo() {
  const selected = 'C. 4';

  return (
    <section
      id="demo"
      className="py-20 md:py-24 bg-brand-light"
    >
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
              Experience the AqTest Environment.
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
              A static preview of how our English-based Math questions feel inside the real simulation
              dashboard — with instant feedback designed by IUP ITB students.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-brand-light p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-xs font-semibold text-brand-primary tracking-wide mb-1">
                  MATHEMATICS · SINGLE CHOICE
                </div>
                <div className="text-xs text-slate-500">
                  Difficulty: Medium · Language: English
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500">Time Remaining</div>
                <div className="px-3 py-1 rounded-full bg-brand-light text-brand-dark text-sm font-semibold">
                  07:32
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <p className="text-base md:text-lg text-slate-800 font-medium mb-2">
                If f(x) = 2x + 1 and g(x) = x², what is (f ∘ g)(3)?
              </p>
              <p className="text-sm text-slate-500 italic">
                (Use function composition: f(g(x)) )
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {options.map((option) => {
                const isSelected = option === selected;
                return (
                  <button
                    key={option}
                    type="button"
                    className={[
                      'flex items-center justify-between w-full rounded-lg border px-4 py-3 text-left text-sm md:text-base transition-all',
                      isSelected
                        ? 'border-brand-secondary bg-brand-secondary/10 text-brand-dark shadow-sm'
                        : 'border-brand-light bg-white hover:border-brand-primary hover:bg-brand-light/60',
                    ].join(' ')}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <span className="text-xs font-semibold text-brand-secondary">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Box */}
            <div className="rounded-xl border border-brand-secondary/60 bg-brand-secondary/10 p-4 md:p-5">
              <div className="text-xs font-semibold text-brand-secondary tracking-wide mb-1">
                FEEDBACK
              </div>
              <p className="text-sm md:text-base text-slate-800 mb-2">
                <span className="font-semibold">Correct!</span> The function composition (f ∘ g)(3)
                means f(g(3)). First compute g(3) = 3² = 9, then apply f: f(9) = 2 · 9 + 1 = 19.
              </p>
              <p className="text-xs md:text-sm text-slate-600">
                Every question in GoldenPath includes detailed reasoning like this, so you do not just
                memorize formulas — you understand the logic that IUP ITB cares about.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

