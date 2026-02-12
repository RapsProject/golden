import { Container } from '../ui/Container';
import { Button } from '../ui/Button';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Try out the experience with limited questions and basic analytics.',
    features: ['Access to selected AqTest-style questions', 'Basic timer mode', 'Email support'],
    highlighted: false,
  },
  {
    name: 'IUP Focus',
    price: 'IDR 349K',
    description: 'Best for serious candidates targeting the next IUP ITB intake.',
    features: [
      'Full AqTest question bank',
      'Real-time simulation & analytics',
      'Strategy modules from IUP ITB students',
      'Progress tracking across subjects',
    ],
    highlighted: true,
  },
  {
    name: 'Mentorship',
    price: 'IDR 599K',
    description: 'Includes everything in IUP Focus plus group mentoring sessions.',
    features: [
      'All IUP Focus features',
      'Weekly group Q&A with mentors',
      'Review of your performance profile',
    ],
    highlighted: false,
  },
];

interface PricingProps {
  onNavigateComingSoon?: () => void;
}

export function Pricing({ onNavigateComingSoon }: PricingProps) {
  return (
    <section
      id="pricing"
      className="py-20 md:py-24 bg-brand-dark"
    >
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Choose Your Path to ITB International.
          </h2>
          <p className="text-brand-secondary text-base md:text-lg max-w-2xl mx-auto">
            Start free, then upgrade when you&apos;re ready to commit. Every plan is designed to match a
            different stage of your preparation journey.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                'flex flex-col rounded-2xl border bg-slate-900/60 p-6 md:p-8',
                plan.highlighted
                  ? 'border-brand-primary shadow-2xl scale-105 md:scale-110'
                  : 'border-slate-700 shadow-lg',
              ].join(' ')}
            >
              {plan.highlighted && (
                <div className="mb-3 inline-flex self-start rounded-full bg-brand-primary/20 px-3 py-1 text-xs font-semibold text-brand-secondary">
                  Best Value
                </div>
              )}

              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{plan.price}</div>
              <p className="text-sm text-brand-secondary mb-6">{plan.description}</p>

              <ul className="space-y-2 text-sm text-slate-100 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-secondary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="primary"
                size="md"
                className="w-full bg-white text-brand-dark hover:bg-brand-secondary hover:text-white"
                onClick={onNavigateComingSoon}
              >
                Choose Plan
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

