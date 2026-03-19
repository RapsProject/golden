import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { syncProfile } from '../../../lib/api';

export function GoogleCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token && session.user && isMounted) {
          try {
            await syncProfile(session.access_token, {
              email: session.user.email ?? undefined,
              full_name: session.user.user_metadata
                ?.full_name as string | undefined,
            });
          } catch (err) {
            console.warn(
              '[GoogleCallback] syncProfile gagal (optional):',
              err instanceof Error ? err.message : err,
            );
          }

          const createdAt = new Date(session.user.created_at).getTime();
          const isNewUser = Date.now() - createdAt < 5 * 60 * 1000;
          navigate('/dashboard', {
            replace: true,
            state: isNewUser ? { isNewUser: true } : undefined,
          });
        } else if (isMounted) {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.warn(
          '[GoogleCallback] getSession error:',
          err instanceof Error ? err.message : err,
        );
        if (isMounted) {
          navigate('/login', { replace: true });
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
          Menyelesaikan login dengan Google…
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-2">
          Mohon tunggu sebentar, kami sedang menyiapkan akunmu.
        </p>
      </div>
    </div>
  );
}

