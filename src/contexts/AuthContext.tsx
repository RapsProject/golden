import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// Minimal types that match supabase's shape without importing from @supabase/supabase-js
interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AuthSession {
  user: AuthUser;
  access_token: string;
  [key: string]: unknown;
}

type AuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  accessToken: string | null;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef<{ auth: Record<string, AnyFn> } | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    import('../lib/supabase').then(({ supabase }) => {
      if (cancelled) return;
      clientRef.current = supabase;

      supabase.auth.getSession().then((result: { data: { session: AuthSession | null } }) => {
        if (cancelled) return;
        const s = result.data.session;
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: string, s: AuthSession | null) => {
        if (cancelled) return;
        setSession(s);
        setUser(s?.user ?? null);
      });

      unsubRef.current = () => subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  }, []);

  const getClient = useCallback(async () => {
    if (clientRef.current) return clientRef.current;
    const { supabase } = await import('../lib/supabase');
    clientRef.current = supabase;
    return supabase;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = await getClient();
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  }, [getClient]);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const client = await getClient();
      const { error } = await client.auth.signUp({
        email,
        password,
        options: fullName ? { data: { full_name: fullName } } : undefined,
      });
      return { error: error ?? null };
    },
    [getClient]
  );

  const signInWithGoogle = useCallback(async () => {
    const client = await getClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    return { error: error ?? null };
  }, [getClient]);

  const signOut = useCallback(async () => {
    const client = await getClient();
    await client.auth.signOut();
  }, [getClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      accessToken: session?.access_token ?? null,
      signInWithGoogle,
    }),
    [user, session, loading, signIn, signUp, signOut, signInWithGoogle]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
