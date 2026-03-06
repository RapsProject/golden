import { useMemo, useState } from 'react';
import { Chrome, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { syncProfile } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.length > 3 && password.length > 3 && !loading,
    [email, password, loading]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      console.log('[Login] Berhasil login. Token ada:', true, 'panjang:', session.access_token.length, 'user id:', session.user?.id);
      try {
        await syncProfile(session.access_token, {
          email,
          full_name: session.user?.user_metadata?.full_name as string | undefined,
        });
        console.log('[Login] syncProfile ke backend: sukses');
      } catch (err) {
        console.warn('[Login] syncProfile ke backend gagal (optional):', err instanceof Error ? err.message : err);
        // sync optional; user can still use app
      }
    } else {
      console.warn('[Login] Berhasil login tapi session/access_token tidak ada');
    }
    setLoading(false);
    navigate('/dashboard');
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);

    if (!email || email.length <= 3) {
      setError('Masukkan email yang valid terlebih dahulu.');
      return;
    }

    setResetLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (resetError) {
        setError(resetError.message);
      } else {
        setInfo('Link reset password sudah dikirim ke email kamu.');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan. Silakan coba lagi.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-xl font-bold font-serif text-brand-dark mb-2 cursor-pointer"
        >
          Sabi<span className="text-brand-primary">Academia</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
          Welcome Back
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-2">
          Sign in to continue your IUP ITB preparation journey.
        </p>
      </div>

      {/* Google */}
      <Button
        variant="outline"
        size="md"
        className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
        icon={Chrome}
        iconPosition="left"
        onClick={() => navigate("/coming-soon")}
      >
        Sign in with Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-slate-200 flex-1" />
        <div className="text-xs text-slate-500">or email</div>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {info && (
        <p className="text-sm text-emerald-700 mb-3 rounded-lg bg-emerald-50 px-3 py-2">
          {info}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 mb-4 rounded-lg bg-red-50 px-3 py-2">
          {error}
        </p>
      )}

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-brand-primary hover:text-brand-dark disabled:opacity-60"
              onClick={handleForgotPassword}
              disabled={resetLoading}
            >
              {resetLoading ? 'Sending link…' : 'Forgot password?'}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="pr-12"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          className="w-full rounded-lg"
          disabled={!canSubmit}
          type="submit"
        >
          {loading ? "Signing in…" : "Log In"}
        </Button>
      </form>

      <p className="text-sm text-slate-600 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="text-brand-primary hover:text-brand-dark font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

