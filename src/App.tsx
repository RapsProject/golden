import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth.tsx';
import { RequireAdmin } from './components/RequireAdmin.tsx';
import { LoadingSpinner } from './components/ui/LoadingSpinner.tsx';

// ── Lazy-loaded layouts ──
const MarketingLayout = lazy(() => import('./app/(marketing)/layout.tsx').then(m => ({ default: m.MarketingLayout })));
const AuthLayout = lazy(() => import('./app/(auth)/layout.tsx').then(m => ({ default: m.AuthLayout })));
const DashboardLayout = lazy(() => import('./app/(dashboard)/layout.tsx').then(m => ({ default: m.DashboardLayout })));
const AdminLayout = lazy(() => import('./app/(admin)/layout.tsx').then(m => ({ default: m.AdminLayout })));

// ── Lazy-loaded pages: Marketing ──
const MarketingPage = lazy(() => import('./app/(marketing)/page.tsx'));
const ComingSoonPage = lazy(() => import('./app/(marketing)/coming-soon/page.tsx').then(m => ({ default: m.ComingSoonPage })));

// ── Lazy-loaded pages: Auth ──
const LoginPage = lazy(() => import('./app/(auth)/login/page.tsx').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./app/(auth)/register/page.tsx').then(m => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('./app/(auth)/reset-password/page.tsx').then(m => ({ default: m.ResetPasswordPage })));
const GoogleCallbackPage = lazy(() => import('./app/(auth)/google-callback/page.tsx').then(m => ({ default: m.GoogleCallbackPage })));

// ── Lazy-loaded pages: Dashboard ──
const DashboardHomePage = lazy(() => import('./app/(dashboard)/dashboard/page.tsx').then(m => ({ default: m.DashboardHomePage })));
const TryOutListPage = lazy(() => import('./app/(dashboard)/tryout/page.tsx').then(m => ({ default: m.TryOutListPage })));
const PracticeListPage = lazy(() => import('./app/(dashboard)/practice/page.tsx').then(m => ({ default: m.PracticeListPage })));
const PreExamPage = lazy(() => import('./app/(dashboard)/tryout/[id]/page.tsx').then(m => ({ default: m.PreExamPage })));
const ExamResultPage = lazy(() => import('./app/(dashboard)/tryout/[id]/result/page.tsx').then(m => ({ default: m.ExamResultPage })));
const ExamPlayPage = lazy(() => import('./app/(dashboard)/tryout/[id]/play/page.tsx').then(m => ({ default: m.ExamPlayPage })));
const AnalyticsPage = lazy(() => import('./app/(dashboard)/analytics/page.tsx').then(m => ({ default: m.AnalyticsPage })));
const ProfilePage = lazy(() => import('./app/(dashboard)/profile/page.tsx').then(m => ({ default: m.ProfilePage })));
const LeaderboardPage = lazy(() => import('./app/(dashboard)/leaderboard/page.tsx').then(m => ({ default: m.LeaderboardPage })));
const SubscriptionPage = lazy(() => import('./app/(dashboard)/subscription/page.tsx').then(m => ({ default: m.SubscriptionPage })));

// ── Lazy-loaded pages: Admin ──
const AdminOverviewPage = lazy(() => import('./app/(admin)/page.tsx').then(m => ({ default: m.AdminOverviewPage })));
const AdminQuestionsPage = lazy(() => import('./app/(admin)/questions/page.tsx').then(m => ({ default: m.AdminQuestionsPage })));
const AdminSubjectsPage = lazy(() => import('./app/(admin)/subjects/page.tsx').then(m => ({ default: m.AdminSubjectsPage })));
const AdminUsersPage = lazy(() => import('./app/(admin)/users/page.tsx').then(m => ({ default: m.AdminUsersPage })));
const AdminUserDetailPage = lazy(() => import('./app/(admin)/users/[id]/page.tsx').then(m => ({ default: m.AdminUserDetailPage })));
const AdminTryoutsPage = lazy(() => import('./app/(admin)/tryouts/page.tsx').then(m => ({ default: m.AdminTryoutsPage })));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* ── Marketing (with Navbar + Footer) ── */}
        <Route element={<MarketingLayout />}>
          <Route index element={<MarketingPage />} />
        </Route>

        {/* ── Coming Soon: standalone, no navbar/footer ── */}
        <Route path="coming-soon" element={<ComingSoonPage />} />

        {/* ── Auth (split-screen, no navbar) ── */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="auth/callback" element={<GoogleCallbackPage />} />
        </Route>

        {/* ── Dashboard (sidebar layout, requires auth) ── */}
        <Route
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<DashboardHomePage />} />
          <Route path="tryout" element={<TryOutListPage />} />
          <Route path="practice" element={<PracticeListPage />} />
          <Route path="tryout/:id" element={<PreExamPage />} />
          <Route path="tryout/:id/result" element={<ExamResultPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
        </Route>

        {/* ── Exam Play: full-screen, requires auth ── */}
        <Route
          path="tryout/:id/play"
          element={
            <RequireAuth>
              <ExamPlayPage />
            </RequireAuth>
          }
        />

        {/* ── Admin Panel: requires admin role ── */}
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="tryouts" element={<AdminTryoutsPage />} />
          <Route path="questions" element={<AdminQuestionsPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
