import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ExamTimer } from '../../../../../components/tryout/ExamTimer';
import { QuestionCard } from '../../../../../components/tryout/QuestionCard';
import { NavigationPalette } from '../../../../../components/tryout/NavigationPalette';
import { useAuth } from '../../../../../contexts/AuthContext';
import {
  getTryoutById,
  saveAnswer,
  submitSession,
  startSession,
  getSession,
} from '../../../../../lib/api';
import type { Question } from '../../../../../lib/mockData';

function sessionStorageKey(tryoutId: string) {
  return `tryout_session_${tryoutId}`;
}

function mapToQuestion(
  q: {
    id: string;
    sequenceNumber: number;
    text: string;
    subjectId: string;
    options: Array<{ id: string; sequenceNumber: number; text: string }>;
  }
): Question {
  return {
    id: q.id,
    subject: 'Simulation',
    text: q.text,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
    correctOptionId: '',
    explanation: '',
  };
}

export function ExamPlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();

  const stateSessionId = (location.state as { sessionId?: string } | null)?.sessionId;

  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (stateSessionId) return stateSessionId;
    if (id) return sessionStorage.getItem(sessionStorageKey(id));
    return null;
  });

  const [tryout, setTryout] = useState<Awaited<ReturnType<typeof getTryoutById>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const sessionIdRef = useRef(sessionId);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  useEffect(() => {
    if (!id || !accessToken) return;
    let cancelled = false;

    (async () => {
      try {
        let resolvedSessionId = sessionId;

        if (!resolvedSessionId) {
          const session = await startSession(accessToken, id);
          if (cancelled || !session) return;
          if (session.status !== 'ongoing') {
            setFatalError('No active session found. Please start from the tryout page.');
            setLoading(false);
            return;
          }
          resolvedSessionId = session.id;
          setSessionId(resolvedSessionId);
        }

        sessionStorage.setItem(sessionStorageKey(id), resolvedSessionId);

        const [tryoutData, sessionData] = await Promise.all([
          getTryoutById(accessToken, id),
          getSession(accessToken, resolvedSessionId),
        ]);

        if (cancelled) return;

        setTryout(tryoutData ?? null);

        if (sessionData) {
          const hydratedAnswers: Record<string, string> = {};
          const hydratedMarked: string[] = [];
          for (const a of sessionData.answers) {
            if (a.optionId) hydratedAnswers[a.questionId] = a.optionId;
            if (a.isMarkedForReview) hydratedMarked.push(a.questionId);
          }
          setAnswers(hydratedAnswers);
          setMarkedQuestions(hydratedMarked);
        }
      } catch (e) {
        if (!cancelled) setFatalError(e instanceof Error ? e.message : 'Failed to load exam');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, accessToken]);

  const handleSubmit = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid || !accessToken || !id) return;
    setSubmitting(true);
    try {
      const result = await submitSession(accessToken, sid);
      sessionStorage.removeItem(sessionStorageKey(id));
      navigate(`/tryout/${id}/result`, { state: { submitResult: result, sessionId: sid } });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }, [id, accessToken, navigate]);

  if (!id) return <Navigate to="/tryout" replace />;
  if (loading) return <p className="p-4 text-slate-600">Loading…</p>;
  if (fatalError) return <Navigate to={`/tryout/${id}`} replace />;
  if (!tryout) return <Navigate to="/tryout" replace />;

  const rawQuestions = tryout.questions ?? [];
  const questions: Question[] = rawQuestions.map(mapToQuestion);
  if (questions.length === 0) return <Navigate to="/tryout" replace />;

  const currentQuestion = questions[currentQuestionIndex];
  const isLast = currentQuestionIndex === questions.length - 1;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    const sid = sessionIdRef.current;
    if (accessToken && sid) {
      saveAnswer(
        accessToken,
        sid,
        questionId,
        optionId,
        markedQuestions.includes(questionId)
      ).catch(() => {});
    }
  };

  const handleToggleMark = (questionId: string) => {
    const sid = sessionIdRef.current;
    const nowMarked = !markedQuestions.includes(questionId);
    setMarkedQuestions((prev) =>
      nowMarked ? [...prev, questionId] : prev.filter((q) => q !== questionId)
    );
    if (accessToken && sid) {
      saveAnswer(
        accessToken,
        sid,
        questionId,
        answers[questionId] ?? null,
        nowMarked
      ).catch(() => {});
    }
  };

  const handleNext = () => {
    if (isLast) setShowConfirm(true);
    else setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-brand-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
          <div className="truncate">
            <span className="text-sm font-semibold text-brand-dark truncate">{tryout.title}</span>
          </div>
          <div className="flex-shrink-0">
            <ExamTimer
              totalSeconds={tryout.durationMinutes * 60}
              onExpire={handleSubmit}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="flex-shrink-0 px-4 py-2 rounded-lg bg-brand-dark text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Finish Attempt
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-5 md:py-6">
        <div className="flex gap-5 lg:gap-6 items-start">
          <div className="flex-1 min-w-0">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedOptionId={answers[currentQuestion.id]}
              isMarked={markedQuestions.includes(currentQuestion.id)}
              onSelectOption={handleSelectOption}
              onToggleMark={handleToggleMark}
              onPrev={handlePrev}
              onNext={handleNext}
              canGoPrev={currentQuestionIndex > 0}
              isLast={isLast}
            />
          </div>
          <div className="hidden lg:block w-[220px] flex-shrink-0">
            <NavigationPalette
              questions={questions}
              answers={answers}
              markedQuestions={markedQuestions}
              currentIndex={currentQuestionIndex}
              onJump={setCurrentQuestionIndex}
            />
          </div>
        </div>
        <div className="lg:hidden mt-5">
          <NavigationPalette
            questions={questions}
            answers={answers}
            markedQuestions={markedQuestions}
            currentIndex={currentQuestionIndex}
            onJump={setCurrentQuestionIndex}
          />
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-serif font-bold text-brand-dark mb-2">
              Submit Your Answers?
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              You have answered{' '}
              <span className="font-semibold text-brand-primary">{answeredCount}</span>{' '}
              out of {questions.length} questions.
              {unansweredCount > 0 && (
                <span className="text-yellow-700 font-medium">
                  {' '}
                  {unansweredCount} question{unansweredCount > 1 ? 's' : ''} unanswered.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
