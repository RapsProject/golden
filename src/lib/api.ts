const BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? "";

type ApiResponse<T> = { success: boolean; message: string; data?: T };

async function request<T>(
  method: string,
  path: string,
  options?: { body?: unknown; token?: string | null },
): Promise<ApiResponse<T>> {
  const url = `${BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.token) headers["Authorization"] = `Bearer ${options.token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: options?.body != null ? JSON.stringify(options.body) : undefined,
  });

  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (!res.ok) {
    throw new Error(json?.message ?? `HTTP ${res.status}`);
  }
  return json;
}

export const api = {
  get: <T>(path: string, token?: string | null) =>
    request<T>("GET", path, { token }),

  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>("POST", path, { body, token }),

  put: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>("PUT", path, { body, token }),

  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>("PATCH", path, { body, token }),

  delete: <T>(path: string, token?: string | null) =>
    request<T>("DELETE", path, { token }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function syncProfile(
  token: string,
  body?: { email?: string; full_name?: string; school_origin?: string },
) {
  const res = await api.post<{ id: string; email: string; fullName: string }>(
    "/api/v1/auth/sync",
    body ?? {},
    token,
  );
  return res.data;
}

export type ProfileData = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  dailyTargetQuestions: number;
  subscriptions: Array<{
    id: string;
    status: string;
    startDate: string;
    plan: { id: string; name: string; price: number; durationDays: number };
  }>;
};

export async function getMe(token: string) {
  const res = await api.get<ProfileData>("/api/v1/auth/me", token);
  return res.data;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export type DashboardStats = {
  fullName: string;
  lastSession: {
    id: string;
    tryoutId: string;
    tryoutTitle: string;
    score: number | null;
    correct: number;
    wrong: number;
    unanswered: number;
    startTime: string;
  } | null;
};

export async function getDashboardStats(token: string) {
  const res = await api.get<DashboardStats>("/api/v1/dashboard/stats", token);
  return res.data;
}

// ─── Tryouts ──────────────────────────────────────────────────────────────────

export async function getTryouts(token: string) {
  const res = await api.get<
    Array<{
      id: string;
      title: string;
      type: string;
      durationMinutes: number;
      maxAttempts: number | null;
      isPremium: boolean;
      isUltimate: boolean;
      isPublished: boolean;
    }>
  >("/api/v1/tryouts", token);
  return res.data ?? [];
}

export async function getTryoutById(token: string, id: string) {
  const res = await api.get<{
    id: string;
    title: string;
    type: string;
    durationMinutes: number;
    maxAttempts: number | null;
    isPremium: boolean;
    isUltimate: boolean;
    isPublished: boolean;
    questions?: Array<{
      id: string;
      sequenceNumber: number;
      text: string;
      imageUrl: string | null;
      subjectId: string;
      topicId: string | null;
      options: Array<{
        id: string;
        sequenceNumber: number;
        text: string;
        imageUrl: string | null;
      }>;
    }>;
  }>("/api/v1/tryouts/" + encodeURIComponent(id), token);
  return res.data;
}

// ─── Admin: Tryout Management ───────────────────────────────────────────────────

export type TryoutData = {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  maxAttempts: number | null;
  isPremium: boolean;
  isUltimate: boolean;
  isPublished: boolean;
  isActive?: boolean;
};

export type CreateTryoutInput = {
  title: string;
  type?: "simulation" | "practice";
  durationMinutes: number;
  maxAttempts?: number;
  isPremium?: boolean;
  isUltimate?: boolean;
  isPublished?: boolean;
};

export type UpdateTryoutInput = Partial<CreateTryoutInput> & {
  isActive?: boolean;
};

export async function getAdminTryouts(token: string): Promise<TryoutData[]> {
  const res = await api.get<TryoutData[]>("/api/v1/admin/tryouts", token);
  return res.data ?? [];
}

export async function createTryout(
  token: string,
  data: CreateTryoutInput,
): Promise<TryoutData | undefined> {
  const res = await api.post<TryoutData>("/api/v1/tryouts", data, token);
  return res.data;
}

export async function updateTryout(
  token: string,
  id: string,
  data: UpdateTryoutInput,
): Promise<TryoutData | undefined> {
  const res = await api.patch<TryoutData>(
    `/api/v1/tryouts/${encodeURIComponent(id)}`,
    data,
    token,
  );
  return res.data;
}

export async function deleteTryout(token: string, id: string): Promise<void> {
  await api.delete(`/api/v1/admin/tryouts/${encodeURIComponent(id)}`, token);
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function startSession(token: string, tryoutId: string) {
  const res = await api.post<{
    id: string;
    userId: string;
    tryoutId: string;
    status: string;
  }>("/api/v1/sessions/start", { tryoutId }, token);
  return res.data;
}

export async function saveAnswer(
  token: string,
  sessionId: string,
  questionId: string,
  optionId: string | null,
  isMarkedForReview?: boolean,
) {
  await api.put(
    `/api/v1/sessions/${encodeURIComponent(sessionId)}/answer`,
    { questionId, optionId, isMarkedForReview: isMarkedForReview ?? false },
    token,
  );
}

export type SessionAnswer = {
  id: string;
  questionId: string;
  optionId: string | null;
  isMarkedForReview: boolean;
  option: { id: string; sequenceNumber: number; text: string } | null;
  question: { id: string; sequenceNumber: number };
};

export type SessionAnswerResult = {
  id: string;
  questionId: string;
  optionId: string | null;
  isMarkedForReview: boolean;
  option: {
    id: string;
    sequenceNumber: number;
    text: string;
    isCorrect: boolean;
  } | null;
  question: {
    id: string;
    sequenceNumber: number;
    text: string;
    imageUrl: string | null;
    explanation: string | null;
    options?: Array<{
      id: string;
      sequenceNumber: number;
      text: string;
      isCorrect: boolean;
    }>;
  };
};

export type SessionData = {
  id: string;
  score: number | null;
  status: string;
  startTime: string;
  endTime?: string | null;
  tryout: { id: string; title: string; durationMinutes: number };
  answers: SessionAnswer[];
};

export type SessionDataCompleted = Omit<SessionData, "answers"> & {
  answers: SessionAnswerResult[];
};

export async function submitSession(token: string, sessionId: string) {
  const res = await api.post<SessionDataCompleted>(
    `/api/v1/sessions/${encodeURIComponent(sessionId)}/submit`,
    undefined,
    token,
  );
  return res.data;
}

export async function getSession(token: string, sessionId: string) {
  const res = await api.get<SessionData | SessionDataCompleted>(
    `/api/v1/sessions/${encodeURIComponent(sessionId)}`,
    token,
  );
  return res.data;
}

export type UserSessionSummary = {
  id: string;
  tryoutId: string;
  score: number | null;
  status: string;
  startTime: string;
  tryout?: { id: string; title: string; type: string };
};

export async function getSessions(token: string) {
  const res = await api.get<UserSessionSummary[]>("/api/v1/sessions", token);
  return res.data ?? [];
}

export async function getAdminUserSessions(
  token: string,
  userId: string,
): Promise<UserSessionSummary[]> {
  const res = await api.get<UserSessionSummary[]>(
    `/api/v1/admin/users/${encodeURIComponent(userId)}/sessions`,
    token,
  );
  return res.data ?? [];
}

// ─── Subscription plans ──────────────────────────────────────────────────────

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  isActive: boolean;
};

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await api.get<SubscriptionPlan[]>("/api/v1/plans");
  return res.data ?? [];
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export type ProfileDetail = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  dailyTargetQuestions: number;
  phoneNumber: string | null;
  dreamMajor: string | null;
  schoolOrigin: string | null;
  subscriptions: Array<{
    id: string;
    status: string;
    startDate: string;
    plan: { id: string; name: string; price: number; durationDays: number };
  }>;
};

export async function getMyProfile(token: string) {
  const res = await api.get<ProfileDetail>("/api/v1/profile/me", token);
  return res.data;
}

export async function updateMyProfile(
  token: string,
  data: {
    phoneNumber?: string;
    dreamMajor?: string;
    fullName?: string;
    schoolOrigin?: string;
  },
) {
  const res = await api.put<ProfileDetail>("/api/v1/profile/me", data, token);
  return res.data;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export type LeaderboardFilterType = "OVERALL" | "SUBJECT" | "TRYOUT" | "DREAM_MAJOR";

export type LeaderboardSubject = "MATHEMATICS" | "PHYSICS";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  fullName: string;
  score: number;
  avatarUrl: string | null;
};

export type LeaderboardParams = {
  filterType: LeaderboardFilterType;
  subject?: LeaderboardSubject;
  examId?: string;
  dreamMajor?: string;
  limit?: number;
};

export async function getLeaderboard(
  token: string,
  params: LeaderboardParams,
): Promise<LeaderboardEntry[]> {
  const qs = new URLSearchParams();
  qs.set("filterType", params.filterType);
  if (params.filterType === "SUBJECT" && params.subject) {
    qs.set("subject", params.subject);
  }
  if (params.filterType === "TRYOUT" && params.examId) {
    qs.set("examId", params.examId);
  }
  if (params.filterType === "DREAM_MAJOR" && params.dreamMajor) {
    qs.set("dreamMajor", params.dreamMajor);
  }
  if (params.limit != null) {
    qs.set("limit", String(params.limit));
  }
  const res = await api.get<LeaderboardEntry[]>(
    `/api/v1/leaderboard?${qs.toString()}`,
    token,
  );
  return res.data ?? [];
}

export async function getDreamMajors(token: string): Promise<string[]> {
  const res = await api.get<string[]>("/api/v1/leaderboard/dream-majors", token);
  return res.data ?? [];
}

// ─── Subjects & Topics ────────────────────────────────────────────────────────

export type SubjectData = {
  id: string;
  name: string;
  description: string | null;
};

export type TopicData = {
  id: string;
  subjectId: string;
  name: string;
};

export async function getSubjects(token: string): Promise<SubjectData[]> {
  const res = await api.get<SubjectData[]>("/api/v1/subjects", token);
  return res.data ?? [];
}

export async function createSubject(
  token: string,
  data: { name: string; description?: string },
): Promise<SubjectData | undefined> {
  const res = await api.post<SubjectData>("/api/v1/subjects", data, token);
  return res.data;
}

export async function deleteSubject(
  token: string,
  subjectId: string,
): Promise<void> {
  await api.delete(`/api/v1/subjects/${encodeURIComponent(subjectId)}`, token);
}

export async function getTopicsBySubject(
  token: string,
  subjectId: string,
): Promise<TopicData[]> {
  const res = await api.get<TopicData[]>(
    `/api/v1/subjects/${encodeURIComponent(subjectId)}/topics`,
    token,
  );
  return res.data ?? [];
}

export async function createTopic(
  token: string,
  subjectId: string,
  data: { name: string },
): Promise<TopicData | undefined> {
  const res = await api.post<TopicData>(
    `/api/v1/subjects/${encodeURIComponent(subjectId)}/topics`,
    data,
    token,
  );
  return res.data;
}

export async function deleteTopic(
  token: string,
  subjectId: string,
  topicId: string,
): Promise<void> {
  await api.delete(
    `/api/v1/subjects/${encodeURIComponent(subjectId)}/topics/${encodeURIComponent(topicId)}`,
    token,
  );
}

// ─── Admin Questions ──────────────────────────────────────────────────────────

export type QuestionOption = {
  id: string;
  sequenceNumber: number;
  text: string;
  imageUrl: string | null;
  isCorrect?: boolean;
};

export type QuestionData = {
  id: string;
  tryoutId: string;
  subjectId: string;
  topicId: string | null;
  sequenceNumber: number;
  text: string;
  imageUrl: string | null;
  explanation: string | null;
  isActive: boolean;
  options: QuestionOption[];
};

export type QuestionFilters = {
  tryoutId?: string;
  tryoutType?: "simulation" | "practice";
  subjectId?: string;
  topicId?: string;
  limit?: number;
  includeInactive?: boolean;
};

export type CreateQuestionInput = {
  tryoutId: string;
  subjectId: string;
  topicId?: string;
  sequenceNumber: number;
  text: string;
  imageUrl?: string;
  explanation?: string;
  options: {
    sequenceNumber: number;
    text: string;
    imageUrl?: string;
    isCorrect: boolean;
  }[];
};

export type UpdateQuestionInput = Partial<
  Omit<CreateQuestionInput, "tryoutId">
> & {
  isActive?: boolean;
};

export async function getQuestions(
  token: string,
  filters?: QuestionFilters,
): Promise<QuestionData[]> {
  const qs = new URLSearchParams();
  if (filters?.tryoutId) qs.set("tryoutId", filters.tryoutId);
  if (filters?.tryoutType) qs.set("tryoutType", filters.tryoutType);
  if (filters?.subjectId) qs.set("subjectId", filters.subjectId);
  if (filters?.topicId) qs.set("topicId", filters.topicId);
  if (filters?.limit != null) qs.set("limit", String(filters.limit));
  if (filters?.includeInactive) qs.set("includeInactive", "true");
  const query = qs.toString();
  const res = await api.get<QuestionData[]>(
    `/api/v1/questions${query ? `?${query}` : ""}`,
    token,
  );
  return res.data ?? [];
}

export async function getQuestionById(
  token: string,
  id: string,
): Promise<QuestionData | undefined> {
  const res = await api.get<QuestionData>(
    `/api/v1/questions/${encodeURIComponent(id)}`,
    token,
  );
  return res.data;
}

export async function createQuestion(
  token: string,
  data: CreateQuestionInput,
): Promise<QuestionData | undefined> {
  const res = await api.post<QuestionData>("/api/v1/questions", data, token);
  return res.data;
}

export async function updateQuestion(
  token: string,
  id: string,
  data: UpdateQuestionInput,
): Promise<QuestionData | undefined> {
  const res = await api.put<QuestionData>(
    `/api/v1/questions/${encodeURIComponent(id)}`,
    data,
    token,
  );
  return res.data;
}

export async function deleteQuestion(token: string, id: string): Promise<void> {
  await api.delete(`/api/v1/questions/${encodeURIComponent(id)}`, token);
}

// ─── Admin: Tryouts (for dropdown in question form) ───────────────────────────

export type TryoutOption = {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  isPremium: boolean;
  isPublished: boolean;
};

export async function getTryoutOptions(token: string): Promise<TryoutOption[]> {
  // Pakai endpoint admin supaya bisa melihat SEMUA tryout
  // (termasuk draft / belum published dan yang non-active),
  // sehingga admin tetap bisa menambah/edit soal untuk tryout draft.
  const res = await api.get<TryoutOption[]>("/api/v1/admin/tryouts", token);
  return res.data ?? [];
}

// ─── Admin: Users ─────────────────────────────────────────────────────────────

export type AdminUserData = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  dreamMajor: string | null;
  phoneNumber: string | null;
  schoolOrigin: string | null;
  createdAt: string;
  subscriptions: Array<{
    id: string;
    status: string;
    startDate: string;
    plan: { id: string; name: string; price: number; durationDays: number };
  }>;
};

export type AdminUsersSummary = {
  totalUsers: number;
  totalActiveSubscriptions: number;
  totalAdmins: number;
  totalStudents: number;
};

export async function getAdminUsers(token: string): Promise<AdminUserData[]> {
  const res = await api.get<AdminUserData[]>("/api/v1/admin/users", token);
  return res.data ?? [];
}

export async function getAdminUsersSummary(
  token: string,
): Promise<AdminUsersSummary | undefined> {
  const res = await api.get<AdminUsersSummary>(
    "/api/v1/admin/users/summary",
    token,
  );
  return res.data;
}
