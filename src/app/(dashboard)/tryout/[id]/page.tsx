import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Clock, FileText, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { getMyProfile, getTryoutById, startSession } from '../../../../lib/api';

function getUserTier(planName?: string): 'free' | 'premium' | 'ultimate' {
  const normalized = planName?.trim().toLowerCase();
  if (normalized === 'ultimate') return 'ultimate';
  if (normalized === 'premium') return 'premium';
  return 'free';
}

function canAccessTryout(
  tryout: { isPremium: boolean; isUltimate: boolean },
  tier: 'free' | 'premium' | 'ultimate',
) {
  if (tier === 'ultimate') return true;
  if (tier === 'premium') return !tryout.isUltimate || tryout.isPremium;
  return !tryout.isPremium && !tryout.isUltimate;
}

export function PreExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [tryout, setTryout] = useState<Awaited<ReturnType<typeof getTryoutById>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id || !accessToken) return;
    let cancelled = false;
    Promise.all([getTryoutById(accessToken, id), getMyProfile(accessToken)])
      .then(([data, profile]) => {
        if (cancelled) return;
        const tier = getUserTier(profile?.subscriptions?.[0]?.plan?.name);
        if (data && canAccessTryout(data, tier)) {
          setTryout(data);
          return;
        }
        setTryout(null);
        setError('Akses tryout ini memerlukan subscription yang sesuai.');
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, accessToken]);

  const handleStart = async () => {
    if (!id || !accessToken || !tryout) return;
    setStarting(true);
    try {
      const session = await startSession(accessToken, id);
      navigate(`/tryout/${id}/play`, { state: { sessionId: session?.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start session');
    } finally {
      setStarting(false);
    }
  };

  if (!id) return <Navigate to="/tryout" replace />;
  if (loading) return <p className="text-slate-600">Loading…</p>;

  if (!tryout) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <p className="text-slate-600">Failed to load this simulation.</p>
        {error && (
          <p className="text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => navigate('/tryout')}
          className="py-2.5 px-4 rounded-lg bg-brand-primary text-white text-sm font-semibold"
        >
          Back to Simulations
        </button>
      </div>
    );
  }

  const questions = tryout.questions ?? [];
  const rules = [
    'Do not refresh the page during the exam — your progress will be lost.',
    'The timer will start immediately when you click "Start Simulation".',
    'Time will auto-submit when the countdown reaches zero.',
    'You can navigate between questions freely using the number palette.',
    'Flag questions you are unsure about using the "Mark" button.',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-brand-light shadow-sm p-6 md:p-8">
        <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-2">
          {tryout.type}
        </p>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark mb-4">
          {tryout.title}
        </h1>
        <p className="text-slate-600 mb-6">
          This simulation mirrors the real IUP ITB AqTest format — English-based questions
          covering Mathematics, Physics, and Logical Reasoning. Train your time management
          and build exam confidence before the actual test.
        </p>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <FileText className="h-4 w-4 text-brand-primary" />
            <span>{questions.length} Questions</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="h-4 w-4 text-brand-primary" />
            <span>{tryout.durationMinutes} Minutes</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldAlert className="h-4 w-4 text-brand-primary" />
            <span>Auto-submit on timeout</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-light shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h2 className="text-base font-semibold text-brand-dark">Rules & Instructions</h2>
        </div>
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li key={rule} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p className="text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2">{error}</p>
      )}

      <button
        type="button"
        onClick={handleStart}
        disabled={starting || questions.length === 0}
        className="w-full py-4 rounded-2xl bg-brand-primary text-white text-base font-bold tracking-wide hover:bg-brand-dark transition-colors shadow-lg disabled:opacity-50"
      >
        {starting ? 'Starting…' : 'START SIMULATION →'}
      </button>
    </div>
  );
}
