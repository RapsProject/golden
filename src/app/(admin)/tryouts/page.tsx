import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Save, ToggleLeft, ToggleRight, X, AlertCircle, Settings2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getAdminTryouts,
  createTryout,
  updateTryout,
  type TryoutData,
  type CreateTryoutInput,
} from '../../../lib/api';

type FormState = {
  title: string;
  type: 'simulation' | 'practice';
  durationMinutes: string;
  maxAttempts: string;
  isPremium: boolean;
  isPublished: boolean;
};

const emptyForm = (): FormState => ({
  title: '',
  type: 'simulation',
  durationMinutes: '120',
  maxAttempts: '',
  isPremium: false,
  isPublished: false,
});

export function AdminTryoutsPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [tryouts, setTryouts] = useState<TryoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTryouts = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await getAdminTryouts(accessToken);
      setTryouts(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat tryout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTryouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (t: TryoutData) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      type: t.type as 'simulation' | 'practice',
      durationMinutes: String(t.durationMinutes),
      maxAttempts: t.maxAttempts != null ? String(t.maxAttempts) : '',
      isPremium: t.isPremium,
      isPublished: t.isPublished,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!form.title.trim() || !form.durationMinutes) {
      setFormError('Title dan duration wajib diisi.');
      return;
    }

    const payload: CreateTryoutInput = {
      title: form.title.trim(),
      type: form.type,
      durationMinutes: Number(form.durationMinutes),
      ...(form.maxAttempts ? { maxAttempts: Number(form.maxAttempts) } : {}),
      isPremium: form.isPremium,
      isPublished: form.isPublished,
    };

    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateTryout(accessToken, editingId, payload);
      } else {
        await createTryout(accessToken, payload);
      }
      setModalOpen(false);
      loadTryouts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Gagal menyimpan tryout');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t: TryoutData) => {
    if (!accessToken) return;
    try {
      await updateTryout(accessToken, t.id, { isActive: !t.isActive });
      loadTryouts();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark">Tryouts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola daftar tryout/simulasi yang tersedia untuk siswa.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Tryout
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Title
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Duration
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Attempts
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Premium
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Published
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Active
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  Memuat…
                </td>
              </tr>
            ) : tryouts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  Belum ada tryout. Klik &quot;New Tryout&quot; untuk membuat.
                </td>
              </tr>
            ) : (
              tryouts.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-800 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{t.type}</td>
                  <td className="px-4 py-3 text-slate-600">{t.durationMinutes} min</td>
                  <td className="px-4 py-3 text-slate-500">
                    {t.maxAttempts != null ? t.maxAttempts : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.isPremium ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.isPublished ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(t)}
                      className="text-brand-primary hover:text-brand-dark transition-colors"
                      title={t.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {t.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/questions?tryoutId=${encodeURIComponent(t.id)}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-brand-light hover:text-brand-dark transition-colors"
                        title="Kelola soal"
                      >
                        <Settings2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-brand-light hover:text-brand-dark transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Tryout Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-brand-dark">
                {editingId ? 'Edit Tryout' : 'New Tryout'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  placeholder="Contoh: IUP ITB Grand Simulation - Batch 2"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value as 'simulation' | 'practice' }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="simulation">Simulation</option>
                    <option value="practice">Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.durationMinutes}
                    onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Max attempts (opsional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxAttempts}
                    onChange={(e) => setForm((p) => ({ ...p, maxAttempts: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <div className="flex flex-col gap-2 mt-4 sm:mt-6">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isPremium}
                      onChange={(e) => setForm((p) => ({ ...p, isPremium: e.target.checked }))}
                      className="accent-brand-primary w-4 h-4"
                    />
                    <span>Premium only</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                      className="accent-brand-primary w-4 h-4"
                    />
                    <span>Published (visible to students)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Menyimpan…' : editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

