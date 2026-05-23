import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left: Form */}
        <div className="flex items-center justify-center w-full bg-white md:w-1/2">
          <div className="w-full max-w-md px-6 py-12 md:px-10 md:py-16">
            <Outlet />
          </div>
        </div>

        <div className="relative items-center justify-center hidden p-12 overflow-hidden text-white md:flex md:w-1/2 bg-brand-dark">
          <div className="absolute w-64 h-64 rounded-full -top-16 -right-16 bg-brand-secondary/20 blur-2xl" />
          <div className="absolute rounded-full -bottom-20 -left-20 w-72 h-72 bg-brand-primary/20 blur-2xl" />

          <div className="relative max-w-md">
            <p className="mb-4 text-sm font-semibold tracking-wide text-brand-secondary">
              SabiAcademia · IUP International Class Preparation
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold">
              “Lolos IUP International Class berkat latihan rutin dan strategi yang tepat.”
            </h2>
            <p className="mb-8 text-slate-100/90">
              Join 500+ students aiming for ITB International. Train with English-based questions,
              real-time simulations, and feedback that builds confidence.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border bg-white/10 rounded-xl border-white/10">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs text-slate-100/80">Students</div>
              </div>
              <div className="p-4 border bg-white/10 rounded-xl border-white/10">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-xs text-slate-100/80">Success</div>
              </div>
              <div className="p-4 border bg-white/10 rounded-xl border-white/10">
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-xs text-slate-100/80">Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

