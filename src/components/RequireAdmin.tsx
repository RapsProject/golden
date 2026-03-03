import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyProfile } from '../lib/api';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading, accessToken } = useAuth();
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    // Debug log: lifecycle & token
    // Akan muncul di DevTools (F12) → Console
    console.log('[RequireAdmin] effect start, hasAccessToken =', Boolean(accessToken));
    if (!accessToken) {
      console.log('[RequireAdmin] no accessToken, skip getMyProfile');
      setRoleLoading(false);
      return;
    }
    getMyProfile(accessToken)
      .then((profile) => {
        console.log('[RequireAdmin] getMyProfile result:', {
          id: profile?.id,
          email: profile?.email,
          role: profile?.role,
        });
        setRole(profile?.role ?? null);
      })
      .catch((err) => {
        console.error('[RequireAdmin] getMyProfile error:', err);
        setRole(null);
      })
      .finally(() => setRoleLoading(false));
  }, [accessToken]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== 'admin') {
    console.warn('[RequireAdmin] blocking access, role =', role);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
