import { useEffect, useState } from 'react';
import {
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import {
  getSessions,
  getSession,
  getTryoutById,
  type SessionDataCompleted,
} from '../../../../../lib/api';

export function ExamResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();

  const locationState = location.state as {
    submitResult?: SessionDataCompleted;
    sessionId?: string;
  } | null;
  const stateResult = locationState?.submitResult;
  const stateSessionId = locationState?.sessionId;

  const [result, setResult] = useState<SessionDataCompleted | null>(stateResult ?? null);
  const [loading, setLoading] = useState(!stateResult);
  const [notFound, setNotFound] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  useEffect(() => {
    if (stateResult || !id || !accessToken) return;
    let cancelled = false;

    (async () => {
      try {
        // Priority 1: explicit sessionId passed from Analytics page
        if (stateSessionId) {
          const sessionData = await getSession(accessToken, stateSessionId);
          if (cancelled || !sessionData) return;
          if (sessionData.status !== 'completed') {
            if (!cancelled) setNotFound(true);
            return;
          }
          if (!cancelled) setResult(sessionData as SessionDataCompleted);
          return;
        }

        // Priority 2: find the latest completed session for this tryoutId
        const sessions = await getSessions(accessToken);
        const completed = sessions
          .filter((s) => s.tryoutId === id && s.status === 'completed')
          .sort(
            (a, b) =>
              new Date(b.startTime ?? 0).getTime() - new Date(a.startTime ?? 0).getTime()
          );

        if (completed.length === 0) {
          if (!cancelled) setNotFound(true);
          return;
        }

        const latest = completed[0]!;
        const sessionData = await getSession(accessToken, latest.id);
        if (cancelled || !sessionData) return;

        if (sessionData.status !== 'completed') {
          if (!cancelled) setNotFound(true);
          return;
        }

        if (!cancelled) setResult(sessionData as SessionDataCompleted);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, accessToken, stateResult, stateSessionId]);

  // Load total number of questions for this tryout,
  // so we can correctly count unanswered (including untouched questions).
  useEffect(() => {
    if (!id || !accessToken) return;
    let cancelled = false;

    (async () => {
      try {
        const tryout = await getTryoutById(accessToken, id);
        if (!cancelled) {
          const count = tryout?.questions?.length ?? 0;
          setTotalQuestions(count > 0 ? count : null);
        }
      } catch {
        if (!cancelled) setTotalQuestions(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, accessToken]);

  if (!id) return <Navigate to="/tryout" replace />;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <p className="text-slate-600">Loading result…</p>
      </div>
    );
  }

  if (notFound || !result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-slate-600">
          No result data. Start a simulation from the tryout detail page.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/tryout/${id}`)}
          className="py-2.5 px-4 rounded-lg bg-brand-primary text-white text-sm font-semibold"
        >
          Back to Tryout
        </button>
      </div>
    );
  }

  const answers = result.answers ?? [];
  const correct = answers.filter((a) => a.option?.isCorrect).length;
  const wrong = answers.filter(
    (a) => a.optionId != null && !a.option?.isCorrect,
  ).length;

  const baseTotal =
    totalQuestions != null && totalQuestions > 0
      ? totalQuestions
      : answers.length;

  const unanswered = Math.max(0, baseTotal - correct - wrong);
  const scoreDisplay = baseTotal > 0 ? Math.round((correct / baseTotal) * 1000) : 0;

  const scoreColor =
    scoreDisplay >= 700
      ? 'text-brand-primary'
      : scoreDisplay >= 500
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-brand-light shadow-sm p-6 md:p-8 text-center">
        <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-2">
          Simulation Complete!
        </p>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark mb-6">
          Result
        </h1>
        <div className={`text-6xl md:text-7xl font-bold mb-1 ${scoreColor}`}>
          {scoreDisplay}
        </div>
        <div className="text-slate-500 text-sm mb-8">out of 1000</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-brand-light rounded-xl p-4">
            <div className="text-2xl font-bold text-brand-primary">{correct}</div>
            <div className="text-xs text-slate-600 mt-1">Correct</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-600">{wrong}</div>
            <div className="text-xs text-slate-600 mt-1">Wrong</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-slate-500">{unanswered}</div>
            <div className="text-xs text-slate-600 mt-1">Unanswered</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-light">
          <h2 className="text-base font-semibold text-brand-dark">Answer Review</h2>
        </div>
        <div className="divide-y divide-brand-light">
          {answers.map((a, idx) => {
            const isCorrect = a.option?.isCorrect ?? false;
            const isUnanswered = a.optionId == null;
            const correctOption = a.question?.options?.find((o) => o.isCorrect);
            return (
              <div key={a.questionId ?? idx} className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {isUnanswered ? (
                      <MinusCircle className="h-5 w-5 text-slate-400" />
                    ) : isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-slate-400">Q{idx + 1}</span>
                  </div>
                </div>
                {correctOption && (isUnanswered || !isCorrect) && (
                  <div className="ml-8 text-xs md:text-sm text-slate-700">
                    <span className="font-semibold text-brand-primary">Correct answer:</span>{' '}
                    <span>{correctOption.text}</span>
                  </div>
                )}
                {a.question?.explanation && (
                  <div className="ml-8 rounded-xl bg-brand-light/60 border border-brand-secondary/30 px-4 py-3">
                    <p className="text-xs font-semibold text-brand-secondary mb-1">
                      EXPLANATION
                    </p>
                    <p className="text-sm text-slate-700">{a.question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pb-6">
        <button
          type="button"
          onClick={() => navigate('/tryout')}
          className="flex-1 py-3 rounded-xl border border-brand-primary text-brand-primary text-sm font-semibold hover:bg-brand-light transition-colors"
        >
          Back to Simulations
        </button>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex-1 py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
