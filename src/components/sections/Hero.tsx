import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Container } from '../ui/Container';

interface HeroProps {
  onNavigateComingSoon?: () => void;
}

export function Hero({ onNavigateComingSoon }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-b from-white to-brand-light pt-24 md:pt-32 pb-20 md:pb-24">
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Side - Text Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6">
              <Badge>
                The #1 IUP ITB Preparation Platform
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brand-dark leading-tight mb-6">
              Secure Your Seat at{' '}
              <span className="text-brand-primary">ITB International Class.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Materi terkurasi, simulasi real-time, dan strategi khusus AqTest dari mahasiswa ITB.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                onClick={onNavigateComingSoon}
              >
                Start Free Simulation
              </Button>
              <Button
                variant="ghost"
                size="lg"
                icon={Eye}
                iconPosition="left"
                onClick={onNavigateComingSoon}
              >
                View Syllabus
              </Button>
            </div>

            {/* Stats or Trust Indicators */}
            <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start">
              <div>
                <div className="text-3xl font-bold text-brand-primary">500+</div>
                <div className="text-sm text-slate-600">Students Enrolled</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-primary">95%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-primary">1000+</div>
                <div className="text-sm text-slate-600">Practice Questions</div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual/Mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative">
              {/* Placeholder for Dashboard Mockup */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-brand-light">
                {/* Mock Dashboard Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Your Progress</span>
                      <span className="text-sm font-bold text-brand-primary">75%</span>
                    </div>
                    <div className="h-3 bg-brand-light rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"></div>
                    </div>
                  </div>

                  {/* Mock Question Card */}
                  <div className="bg-brand-light rounded-lg p-4 mt-6">
                    <div className="text-xs font-semibold text-brand-primary mb-2">MATHEMATICS</div>
                    <p className="text-sm text-slate-700 mb-4">
                      If f(x) = 2x + 1 and g(x) = x², what is (f ∘ g)(3)?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {['A. 19', 'B. 21', 'C. 23', 'D. 25'].map((option) => (
                        <button
                          key={option}
                          className="bg-white text-sm py-2 px-3 rounded-lg hover:border-brand-primary border border-transparent transition-all"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mock Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-brand-dark">24</div>
                      <div className="text-xs text-slate-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-brand-primary">18</div>
                      <div className="text-xs text-slate-600">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-brand-secondary">6</div>
                      <div className="text-xs text-slate-600">Review</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-secondary/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
