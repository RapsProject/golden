import { BookOpen, Timer, BarChart3 } from 'lucide-react';
import { Container } from '../ui/Container';

const features = [
  {
    title: 'AqTest Standard',
    description: 'English-based Math & Physics questions crafted to mirror the real IUP ITB entrance exam.',
    icon: BookOpen,
  },
  {
    title: 'Real-time Timer',
    description: 'Simulate the real pressure of AqTest with adaptive timing and pacing feedback.',
    icon: Timer,
  },
  {
    title: 'Performance Analytics',
    description: 'Visualize strengths and gaps with intuitive charts so you can adjust your study focus.',
    icon: BarChart3,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-20 md:py-24 bg-white"
    >
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
            Built for IUP ITB, Not Generic Exams.
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Every module, timer, and report is designed specifically for AqTest — giving you insider-level preparation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="bg-white border border-brand-light rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-light mb-4">
                <Icon className="h-6 w-6 text-brand-primary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-dark mb-2">{title}</h3>
              <p className="text-sm md:text-base text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

