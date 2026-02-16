import { Navigate, Route, Routes } from 'react-router-dom';
import { MarketingLayout } from './app/(marketing)/layout.tsx';
import MarketingPage from './app/(marketing)/page.tsx';
import { ComingSoonPage } from './app/(marketing)/coming-soon/page.tsx';
import { AuthLayout } from './app/(auth)/layout.tsx';
import { LoginPage } from './app/(auth)/login/page.tsx';
import { RegisterPage } from './app/(auth)/register/page.tsx';
import { DashboardLayout } from './app/(dashboard)/layout.tsx';
import { DashboardHomePage } from './app/(dashboard)/dashboard/page.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<MarketingPage />} />
        <Route path="coming-soon" element={<ComingSoonPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardHomePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
