import { useMemo, useState } from 'react';
import { Chrome, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = useMemo(() => email.length > 3 && password.length > 3, [email, password]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-xl font-bold font-serif text-brand-dark mb-2">
          Sepuh<span className="text-brand-primary">IUP</span>
        </div>
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
        onClick={() => navigate('/coming-soon')}
      >
        Sign in with Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-slate-200 flex-1" />
        <div className="text-xs text-slate-500">or email</div>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Form */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate('/dashboard');
        }}
      >
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
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <button
              type="button"
              className="text-xs text-brand-primary hover:text-brand-dark"
              onClick={() => navigate('/coming-soon')}
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
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
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
          Log In
        </Button>
      </form>

      <p className="text-sm text-slate-600 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-brand-primary hover:text-brand-dark font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}

