import { useEffect, useState } from 'react';
import {
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { QuestionTextRenderer } from '../../../../../components/QuestionTextRenderer';
import {
  getSessions,
  getSession,
  getTryoutById,
  type SessionDataCompleted,
} from '../../../../../lib/api';
import { LatexText } from '../../../../../components/LatexText';

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
      <div className="max-w-3xl py-8 mx-auto">
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

  // Prefer the server-stored score so it matches what the analytics page shows.
  // Only fall back to a client-side calculation when the server score is absent.
  const scoreDisplay =
    result.score != null
      ? result.score
      : baseTotal > 0
        ? Math.round((correct / baseTotal) * 100)
        : 0;

  const scoreColor =
    scoreDisplay >= 70
      ? 'text-brand-primary'
      : scoreDisplay >= 50
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 text-center bg-white border shadow-sm rounded-2xl border-brand-light md:p-8">
        <p className="mb-2 text-xs font-semibold tracking-wide uppercase text-brand-primary">
          Simulation Complete!
        </p>
        <h1 className="mb-6 font-serif text-2xl font-bold md:text-3xl text-brand-dark">
          Result
        </h1>
        <div className={`text-6xl md:text-7xl font-bold mb-1 ${scoreColor}`}>
          {scoreDisplay}
        </div>
        <div className="mb-8 text-sm text-slate-500">out of 100</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-brand-light rounded-xl">
            <div className="text-2xl font-bold text-brand-primary">{correct}</div>
            <div className="mt-1 text-xs text-slate-600">Correct</div>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-600">{wrong}</div>
            <div className="mt-1 text-xs text-slate-600">Wrong</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-slate-500">{unanswered}</div>
            <div className="mt-1 text-xs text-slate-600">Unanswered</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-brand-light">
        <div className="px-5 py-4 border-b border-brand-light">
          <h2 className="text-base font-semibold text-brand-dark">Answer Review</h2>
        </div>
        <div className="divide-y divide-brand-light">
          {answers.map((a, idx) => {
            const isCorrect = a.option?.isCorrect ?? false;
            const isUnanswered = a.optionId == null;
            const correctOption = a.question?.options?.find((o) => o.isCorrect);
            const bgClass = isUnanswered ? 'bg-slate-50' : isCorrect ? 'bg-teal-50/40' : 'bg-red-50/40';
            return (
              <div key={a.questionId ?? idx} className={`p-5 space-y-3 ${bgClass}`}>
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {isUnanswered ? (
                      <MinusCircle className="w-5 h-5 text-slate-400" />
                    ) : isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center min-w-0 gap-2">
                    <span className="text-xs font-semibold text-slate-500">Q{idx + 1}</span>
                    {isUnanswered ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">Unanswered</span>
                    ) : isCorrect ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-brand-light text-brand-primary px-2 py-0.5 rounded-md">Correct</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600 px-2 py-0.5 rounded-md">Wrong Answer</span>
                    )}
                  </div>
                </div>

                {a.question && (a.question.text || a.question.imageUrl) && (
                  <div className="mb-4 ml-8">
                    <QuestionTextRenderer 
                      text={a.question.text} 
                      imageUrl={a.question.imageUrl} 
                      className="text-sm md:text-base text-slate-800" 
                    />
                  </div>
                )}

                <div className="ml-8 text-xs md:text-sm text-slate-700">
                  <span className="font-semibold text-slate-600">Your answer:</span>{' '}
                  <span>{isUnanswered ? '—' : (a.option?.text != null ? <LatexText>{a.option.text}</LatexText> : '—')}</span>
                </div>
                {correctOption && (isUnanswered || !isCorrect) && (
                  <div className="ml-8 text-xs md:text-sm text-slate-700">
                    <span className="font-semibold text-brand-primary">Correct answer:</span>{' '}
                    <span><LatexText>{correctOption.text}</LatexText></span>
                  </div>
                )}
                {a.question?.explanation && (
                  <div className="px-4 py-3 ml-8 border rounded-xl bg-brand-light/60 border-brand-secondary/30">
                    <p className="mb-1 text-xs font-semibold text-brand-secondary">
                      EXPLANATION
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-words"><LatexText>{a.question.explanation}</LatexText></p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/tryout')}
            className="flex-1 py-3 text-sm font-semibold transition-colors border rounded-xl border-brand-primary text-brand-primary hover:bg-brand-secondary/20"
          >
            Back to Simulations
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3 text-sm font-semibold text-white transition-colors rounded-xl bg-brand-primary hover:bg-brand-dark"
          >
            Go to Dashboard
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/analytics')}
          className="w-full py-3 text-sm font-semibold transition-colors border rounded-xl border-slate-600 text-slate-600 hover:bg-slate-50"
        >
          Back to Analytics
        </button>
      </div>
    </div>
  );
}
