import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

export function DashboardHomePage() {
  const navigate = useNavigate();

  const mock = {
    name: 'Sudar',
    questionsDone: 120,
    avgScore: 680,
    dailyTargetPercent: 70,
    recent: [
      { title: 'Latihan Matematika', ago: '10 menit lalu', score: 80 },
      { title: 'Latihan English', ago: '2 jam lalu', score: 75 },
      { title: 'Try Out Logika', ago: 'kemarin', score: 82 },
    ],
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-brand-light p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
              Hi, {mock.name}! Ready to conquer AqTest today?
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-2">
              Let&apos;s keep your momentum. Continue where you left off and hit your daily target.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate('/coming-soon')}
          >
            Continue Practice
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Soal Dikerjakan</div>
          <div className="mt-2 text-3xl font-bold text-brand-dark">{mock.questionsDone}</div>
          <div className="mt-1 text-xs text-slate-500">Total questions completed</div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Rata-rata Skor</div>
          <div className="mt-2 text-3xl font-bold text-brand-dark">{mock.avgScore}</div>
          <div className="mt-1 text-xs text-slate-500">Based on recent attempts</div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-600">Target Harian</div>
            <div className="text-sm font-semibold text-brand-primary">
              {mock.dailyTargetPercent}%
            </div>
          </div>
          <div className="mt-3 h-3 rounded-full bg-brand-light overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary'
              )}
              style={{ width: `${mock.dailyTargetPercent}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">7/10 tasks completed</div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-brand-light p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-dark">Recent Activity</h2>
          <button
            type="button"
            className="text-sm font-medium text-brand-primary hover:text-brand-dark"
            onClick={() => navigate('/coming-soon')}
          >
            View all
          </button>
        </div>

        <div className="divide-y divide-brand-light">
          {mock.recent.map((item) => (
            <div
              key={item.title + item.ago}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-sm md:text-base font-medium text-slate-900 truncate">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500">{item.ago}</div>
              </div>
              <div className="shrink-0 text-sm font-semibold text-brand-dark">
                Skor {item.score}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

