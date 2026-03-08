import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setInfo('Password kamu berhasil diubah. Mengarahkan ke halaman login…');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan. Silakan coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xl font-bold font-serif text-brand-dark mb-2 cursor-pointer"
        >
          Sabi<span className="text-brand-primary">Academia</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
          Reset Password
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-2">
          Masukkan password baru untuk akunmu.
        </p>
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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Password baru"
          type="password"
          name="new-password"
          placeholder="Password baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <Input
          label="Konfirmasi password baru"
          type="password"
          name="confirm-password"
          placeholder="Ulangi password baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <Button
          variant="primary"
          size="md"
          className="w-full rounded-lg"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Menyimpan…' : 'Simpan password baru'}
        </Button>
      </form>

      <p className="text-sm text-slate-600 mt-6">
        Kembali ke{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-brand-primary hover:text-brand-dark font-medium"
        >
          halaman login
        </button>
        .
      </p>
    </div>
  );
}

