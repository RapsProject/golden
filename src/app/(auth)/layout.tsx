import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex">
        {/* Left: Form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center">
          <div className="w-full max-w-md px-6 py-12 md:px-10 md:py-16">
            <Outlet />
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-brand-dark text-white items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-secondary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-primary/20 rounded-full blur-2xl" />

          <div className="relative max-w-md">
            <p className="text-brand-secondary text-sm font-semibold tracking-wide mb-4">
              SepuhIUP · IUP ITB Preparation
            </p>
            <h2 className="text-3xl font-serif font-bold mb-4">
              “Lolos IUP ITB berkat latihan rutin dan strategi yang tepat.”
            </h2>
            <p className="text-slate-100/90 mb-8">
              Join 500+ students aiming for ITB International. Train with English-based questions,
              real-time simulations, and feedback that builds confidence.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs text-slate-100/80">Students</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-xs text-slate-100/80">Success</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
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

