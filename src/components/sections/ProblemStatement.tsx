import { CheckCircle2 } from 'lucide-react';
import { Container } from '../ui/Container';

export function ProblemStatement() {
  const points = [
    'Standard UTBK prep does not cover AqTest-style logic problems.',
    'You need English-based Math & Physics specifically tailored for ITB IUP.',
    'Time pressure and adaptive question styles require different strategies.',
  ];

  return (
    <section
      id="problem"
      className="py-20 md:py-24 bg-white"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Visual Left */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-light rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -right-4 w-28 h-28 bg-brand-secondary/30 rounded-full blur-2xl" />

            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl shadow-2xl p-8 border border-brand-secondary/30">
              <div className="text-brand-secondary text-sm font-semibold tracking-wide mb-4">
                Traditional Prep Materials
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                Stacks of outdated UTBK books won&apos;t get you into ITB International.
              </h2>

              <p className="text-slate-300 text-sm md:text-base mb-6">
                IUP ITB entrance exam is designed differently — more logic, more English, and
                more application. The usual drill books simply don&apos;t match the questions you&apos;ll face.
              </p>

              <div className="space-y-3">
                {points.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-secondary" />
                    <p className="text-slate-200 text-sm md:text-base">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Right */}
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
              ITB IUP Entrance Exam is NOT UTBK.
            </h2>
            <p className="text-slate-600 text-base md:text-lg mb-6">
              Regular national exam prep focuses on standard curriculum and Bahasa Indonesia questions.
              AqTest for IUP ITB is built differently — it combines English proficiency, mathematical
              reasoning, and scientific logic in one high-pressure environment.
            </p>
            <p className="text-slate-600 text-base md:text-lg mb-4">
              Without the right blueprint, you might be practicing hard but for the wrong game.
              GoldenPath helps you align every study session with the actual demands of the IUP ITB exam.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

