import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      email.length > 3 &&
      password.length >= 6 &&
      passwordsMatch &&
      agree
    );
  }, [agree, email, fullName, password, passwordsMatch]);

  return (
    <div>
      <div className="mb-8">
        <div className="text-xl font-bold font-serif text-brand-dark mb-2">
          Sepuh<span className="text-brand-primary">IUP</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
          Start Your Journey
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-2">
          Create an account to track your progress and unlock simulations.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate('/dashboard');
        }}
      >
        <Input
          label="Full Name"
          name="fullName"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

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
          <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="pr-12"
              error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/30"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            I agree to{' '}
            <button
              type="button"
              className="text-brand-primary hover:text-brand-dark font-medium"
              onClick={() => navigate('/coming-soon')}
            >
              Terms
            </button>{' '}
            &{' '}
            <button
              type="button"
              className="text-brand-primary hover:text-brand-dark font-medium"
              onClick={() => navigate('/coming-soon')}
            >
              Privacy Policy
            </button>
            .
          </span>
        </label>

        <Button variant="primary" size="md" className="w-full" disabled={!canSubmit} type="submit">
          Create Account
        </Button>
      </form>

      <p className="text-sm text-slate-600 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-primary hover:text-brand-dark font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}

