// ─── Types ───────────────────────────────────────────────────────────────────
export type Option = {
  id: string;
  text: string;
  imageUrl?: string;
};

export type Question = {
  id: string;
  subject: string;
  text: string;
  imageUrl?: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
};

export type TryoutMeta = {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  durationMinutes: number;
  status: 'not-started' | 'completed';
  score?: number;
};

// ─── Tryout List ─────────────────────────────────────────────────────────────
export const mockTryouts: TryoutMeta[] = [
  {
    id: 'test-01',
    title: 'IUP ITB Mock Test – Batch 1',
    subject: 'Mathematics & Physics',
    totalQuestions: 5,
    durationMinutes: 90,
    status: 'not-started',
  },
  {
    id: 'test-02',
    title: 'IUP ITB Mock Test – Batch 2',
    subject: 'English & Logical Reasoning',
    totalQuestions: 5,
    durationMinutes: 60,
    status: 'completed',
    score: 850,
  },
];

// ─── Questions ────────────────────────────────────────────────────────────────
const questionsTest01: Question[] = [
  {
    id: 'q1',
    subject: 'MATHEMATICS',
    text: 'If the roots of the equation x² − px + q = 0 are consecutive integers, then the value of p² − 4q is...',
    options: [
      { id: 'q1-a', text: '1' },
      { id: 'q1-b', text: '2' },
      { id: 'q1-c', text: '3' },
      { id: 'q1-d', text: '4' },
    ],
    correctOptionId: 'q1-a',
    explanation:
      "Let the roots be n and n+1. By Vieta's formulas: p = (2n+1) and q = n(n+1). Therefore p² − 4q = (2n+1)² − 4n(n+1) = 4n² + 4n + 1 − 4n² − 4n = 1.",
  },
  {
    id: 'q2',
    subject: 'MATHEMATICS',
    text: 'Given f(x) = 2x + 1 and g(x) = x², what is the value of (f ∘ g)(3)?',
    options: [
      { id: 'q2-a', text: '17' },
      { id: 'q2-b', text: '18' },
      { id: 'q2-c', text: '19' },
      { id: 'q2-d', text: '21' },
    ],
    correctOptionId: 'q2-c',
    explanation:
      '(f ∘ g)(3) means f(g(3)). First compute g(3) = 3² = 9, then apply f: f(9) = 2(9) + 1 = 19.',
  },
  {
    id: 'q3',
    subject: 'PHYSICS',
    text: 'A car starts from rest and accelerates uniformly, reaching a velocity of 20 m/s in exactly 5 seconds. What is the total distance covered during this acceleration?',
    options: [
      { id: 'q3-a', text: '40 m' },
      { id: 'q3-b', text: '50 m' },
      { id: 'q3-c', text: '60 m' },
      { id: 'q3-d', text: '100 m' },
    ],
    correctOptionId: 'q3-b',
    explanation:
      'Using s = ½(u + v)t = ½(0 + 20)(5) = 50 m. Alternatively: acceleration a = 20/5 = 4 m/s², so s = ½at² = ½(4)(25) = 50 m.',
  },
  {
    id: 'q4',
    subject: 'MATHEMATICS',
    text: 'If sin θ = 3/5 and θ is in the first quadrant, what is the exact value of tan θ?',
    options: [
      { id: 'q4-a', text: '1/3' },
      { id: 'q4-b', text: '2/3' },
      { id: 'q4-c', text: '3/4' },
      { id: 'q4-d', text: '4/3' },
    ],
    correctOptionId: 'q4-c',
    explanation:
      'Since sin θ = 3/5, apply the Pythagorean identity: cos θ = √(1 − (3/5)²) = 4/5. Therefore tan θ = sin θ / cos θ = (3/5) ÷ (4/5) = 3/4.',
  },
  {
    id: 'q5',
    subject: 'ENGLISH',
    text: '"The student\'s performance was exemplary, demonstrating a remarkable grasp of complex mathematical concepts." In this context, what does "exemplary" most nearly mean?',
    options: [
      { id: 'q5-a', text: 'Average and typical' },
      { id: 'q5-b', text: 'Disappointing and below standard' },
      { id: 'q5-c', text: 'Outstanding and serving as a model' },
      { id: 'q5-d', text: 'Confusing and difficult to understand' },
    ],
    correctOptionId: 'q5-c',
    explanation:
      '"Exemplary" means serving as a desirable model or being of an exceptionally high quality. The surrounding phrase "remarkable grasp" confirms the strong positive meaning.',
  },
];

// Test-02 reuses the same question bank with re-scoped IDs.
const questionsTest02: Question[] = questionsTest01.map((q) => ({
  ...q,
  id: `t2-${q.id}`,
  options: q.options.map((o) => ({ ...o, id: `t2-${o.id}` })),
  correctOptionId: `t2-${q.correctOptionId}`,
}));

export const mockQuestions: Record<string, Question[]> = {
  'test-01': questionsTest01,
  'test-02': questionsTest02,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getTryoutMeta(id: string): TryoutMeta | undefined {
  return mockTryouts.find((t) => t.id === id);
}

export function getQuestions(id: string): Question[] {
  return mockQuestions[id] ?? [];
}

export function calculateScore(
  questions: Question[],
  answers: Record<string, string>
): { correct: number; wrong: number; unanswered: number; total: number; score: number } {
  const total = questions.length;
  let correct = 0;
  let wrong = 0;

  for (const q of questions) {
    const selected = answers[q.id];
    if (!selected) continue;
    if (selected === q.correctOptionId) correct++;
    else wrong++;
  }

  const unanswered = total - correct - wrong;
  const score = Math.round((correct / total) * 1000);

  return { correct, wrong, unanswered, total, score };
}
