import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth.tsx';
import { RequireAdmin } from './components/RequireAdmin.tsx';
import { MarketingLayout } from './app/(marketing)/layout.tsx';
import MarketingPage from './app/(marketing)/page.tsx';
import { ComingSoonPage } from './app/(marketing)/coming-soon/page.tsx';
import { AuthLayout } from './app/(auth)/layout.tsx';
import { LoginPage } from './app/(auth)/login/page.tsx';
import { RegisterPage } from './app/(auth)/register/page.tsx';
import { ResetPasswordPage } from './app/(auth)/reset-password/page.tsx';
import { GoogleCallbackPage } from './app/(auth)/google-callback/page.tsx';
import { DashboardLayout } from './app/(dashboard)/layout.tsx';
import { DashboardHomePage } from './app/(dashboard)/dashboard/page.tsx';
import { TryOutListPage } from './app/(dashboard)/tryout/page.tsx';
import { PracticeListPage } from './app/(dashboard)/practice/page.tsx';
import { PreExamPage } from './app/(dashboard)/tryout/[id]/page.tsx';
import { ExamResultPage } from './app/(dashboard)/tryout/[id]/result/page.tsx';
import { ExamPlayPage } from './app/(dashboard)/tryout/[id]/play/page.tsx';
import { AnalyticsPage } from './app/(dashboard)/analytics/page.tsx';
import { ProfilePage } from './app/(dashboard)/profile/page.tsx';
import { LeaderboardPage } from './app/(dashboard)/leaderboard/page.tsx';
import { SubscriptionPage } from './app/(dashboard)/subscription/page.tsx';
import { AdminLayout } from './app/(admin)/layout.tsx';
import { AdminOverviewPage } from './app/(admin)/page.tsx';
import { AdminQuestionsPage } from './app/(admin)/questions/page.tsx';
import { AdminSubjectsPage } from './app/(admin)/subjects/page.tsx';
import { AdminUsersPage } from './app/(admin)/users/page.tsx';
import { AdminUserDetailPage } from './app/(admin)/users/[id]/page.tsx';
import { AdminTryoutsPage } from './app/(admin)/tryouts/page.tsx';

export default function App() {
  return (
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
  );
}
