import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Container } from "../ui/Container";

interface HeroProps {
  onNavigateRegister?: () => void;
  onNavigateComingSoon?: () => void;
}

export function Hero({ onNavigateRegister }: HeroProps) {
  return (
    <section className="relative pt-24 pb-20 bg-gradient-to-b from-white to-brand-light md:pt-32 md:pb-24">
      <Container>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Left Side - Text Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6">
              <Badge>The #1 IUP ITB Preparation Platform</Badge>
            </div>

            {/* Headline */}
            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-brand-dark">
              Secure Your Seat at{" "}
              <span className="text-brand-primary">
                ITB International Class.
              </span>
            </h1>

            {/* Subheading */}
            <p className="max-w-2xl mx-auto mb-8 text-lg md:text-xl text-slate-600 lg:mx-0">
              Materi terkurasi, simulasi real-time, dan strategi khusus AqTest
              dari mahasiswa ITB.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                onClick={onNavigateRegister}
              >
                Start Free Simulation
              </Button>
            </div>

            {/* Stats or Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 lg:justify-start">
              <div>
                <div className="text-3xl font-bold text-brand-primary">
                  500+
                </div>
                <div className="text-sm text-slate-600">Students Enrolled</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-primary">95%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-primary">
                  1000+
                </div>
                <div className="text-sm text-slate-600">Practice Questions</div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual/Mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative">
              {/* Placeholder for Dashboard Mockup */}
              <div className="p-6 bg-white border shadow-2xl rounded-2xl border-brand-light">
                {/* Mock Dashboard Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        Your Progress
                      </span>
                      <span className="text-sm font-bold text-brand-primary">
                        75%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-brand-light">
                      <div className="w-3/4 h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
                    </div>
                  </div>

                  {/* Mock Question Card */}
                  <div className="p-4 mt-6 rounded-lg bg-brand-light">
                    <div className="mb-2 text-xs font-semibold text-brand-primary">
                      MATHEMATICS
                    </div>
                    <p className="mb-4 text-sm text-slate-700">
                      If f(x) = 2x + 1 and g(x) = x², what is (f ∘ g)(3)?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {["A. 19", "B. 21", "C. 23", "D. 25"].map((option) => (
                        <button
                          key={option}
                          className="px-3 py-2 text-sm transition-all bg-white border border-transparent rounded-lg hover:border-brand-primary"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mock Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-brand-dark">
                        24
                      </div>
                      <div className="text-xs text-slate-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-brand-primary">
                        18
                      </div>
                      <div className="text-xs text-slate-600">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-brand-secondary">
                        6
                      </div>
                      <div className="text-xs text-slate-600">Wrong</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute w-24 h-24 rounded-full -top-6 -right-6 bg-brand-secondary/20 blur-2xl"></div>
              <div className="absolute w-32 h-32 rounded-full -bottom-6 -left-6 bg-brand-primary/20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
