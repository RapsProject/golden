import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Save, ToggleLeft, ToggleRight, X, AlertCircle, Settings2, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getAdminTryouts,
  createTryout,
  updateTryout,
  deleteTryout,
  getQuestions,
  getTryoutById,
  getSubjects,
  getTopicsBySubject,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type TryoutData,
  type CreateTryoutInput,
  type QuestionData,
  type SubjectData,
  type TopicData,
  type CreateQuestionInput,
} from '../../../lib/api';
import { LatexText } from '../../../components/LatexText';

type OptionDraft = { sequenceNumber: number; text: string; imageUrl: string; isCorrect: boolean };
const emptyOption = (seq: number): OptionDraft => ({ sequenceNumber: seq, text: '', imageUrl: '', isCorrect: false });

type QuestionFormState = {
  tryoutId: string;
  subjectId: string;
  topicId: string;
  sequenceNumber: string;
  text: string;
  imageUrl: string;
  explanation: string;
  options: OptionDraft[];
};
const emptyQuestionForm = (tryoutId: string): QuestionFormState => ({
  tryoutId,
  subjectId: '',
  topicId: '',
  sequenceNumber: '1',
  text: '',
  imageUrl: '',
  explanation: '',
  options: [emptyOption(1), emptyOption(2), emptyOption(3), emptyOption(4)],
});
function questionFormToPayload(form: QuestionFormState): CreateQuestionInput {
  return {
    tryoutId: form.tryoutId,
    subjectId: form.subjectId,
    ...(form.topicId ? { topicId: form.topicId } : {}),
    sequenceNumber: Number(form.sequenceNumber),
    text: form.text,
    ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
    ...(form.explanation ? { explanation: form.explanation } : {}),
    options: form.options.map((o) => ({
      sequenceNumber: o.sequenceNumber,
      text: o.text,
      ...(o.imageUrl ? { imageUrl: o.imageUrl } : {}),
      isCorrect: o.isCorrect,
    })),
  };
}

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
  const [filterType, setFilterType] = useState<'all' | 'simulation' | 'practice'>('all');
  const [searchTitle, setSearchTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [previewTryout, setPreviewTryout] = useState<TryoutData | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<QuestionData[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [questionEditingId, setQuestionEditingId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(emptyQuestionForm(''));
  const [questionSubjects, setQuestionSubjects] = useState<SubjectData[]>([]);
  const [questionFormTopics, setQuestionFormTopics] = useState<TopicData[]>([]);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [questionFormError, setQuestionFormError] = useState<string | null>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

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

  const openPreview = async (t: TryoutData) => {
    setPreviewTryout(t);
    setPreviewQuestions([]);
    if (!accessToken) return;
    setPreviewLoading(true);
    try {
      let questions: QuestionData[] = await getQuestions(accessToken, {
        tryoutId: t.id,
        limit: 200,
        includeInactive: true,
      });
      if (questions.length === 0) {
        const tryoutDetail = await getTryoutById(accessToken, t.id);
        if (tryoutDetail?.questions?.length) {
          questions = tryoutDetail.questions.map((q) => ({
            id: q.id,
            tryoutId: t.id,
            subjectId: q.subjectId,
            topicId: q.topicId ?? null,
            sequenceNumber: q.sequenceNumber,
            text: q.text,
            imageUrl: q.imageUrl ?? null,
            explanation: null,
            isActive: true,
            options: q.options.map((o) => ({
              id: o.id,
              sequenceNumber: o.sequenceNumber,
              text: o.text,
              imageUrl: o.imageUrl ?? null,
              isCorrect: false,
            })),
          }));
        }
      }
      setPreviewQuestions(questions.sort((a, b) => a.sequenceNumber - b.sequenceNumber));
    } catch {
      setPreviewQuestions([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const refreshPreviewQuestions = async () => {
    if (!accessToken || !previewTryout) return;
    try {
      let questions: QuestionData[] = await getQuestions(accessToken, {
        tryoutId: previewTryout.id,
        limit: 200,
        includeInactive: true,
      });
      if (questions.length === 0) {
        const tryoutDetail = await getTryoutById(accessToken, previewTryout.id);
        if (tryoutDetail?.questions?.length) {
          questions = tryoutDetail.questions.map((q) => ({
            id: q.id,
            tryoutId: previewTryout.id,
            subjectId: q.subjectId,
            topicId: q.topicId ?? null,
            sequenceNumber: q.sequenceNumber,
            text: q.text,
            imageUrl: q.imageUrl ?? null,
            explanation: null,
            isActive: true,
            options: q.options.map((o) => ({
              id: o.id,
              sequenceNumber: o.sequenceNumber,
              text: o.text,
              imageUrl: o.imageUrl ?? null,
              isCorrect: false,
            })),
          }));
        }
      }
      setPreviewQuestions(questions.sort((a, b) => a.sequenceNumber - b.sequenceNumber));
    } catch {
      /* ignore */
    }
  };

  const openCreateQuestion = async () => {
    if (!previewTryout) return;
    setQuestionEditingId(null);
    setQuestionForm(emptyQuestionForm(previewTryout.id));
    setQuestionFormError(null);
    setQuestionFormTopics([]);
    setQuestionFormOpen(true);
    if (accessToken) {
      getSubjects(accessToken).then(setQuestionSubjects).catch(() => setQuestionSubjects([]));
    }
  };

  const openEditQuestion = async (q: QuestionData) => {
    setQuestionEditingId(q.id);
    setQuestionForm({
      tryoutId: q.tryoutId,
      subjectId: q.subjectId,
      topicId: q.topicId ?? '',
      sequenceNumber: String(q.sequenceNumber),
      text: q.text,
      imageUrl: q.imageUrl ?? '',
      explanation: q.explanation ?? '',
      options: q.options.map((o) => ({
        sequenceNumber: o.sequenceNumber,
        text: o.text,
        imageUrl: o.imageUrl ?? '',
        isCorrect: o.isCorrect ?? false,
      })),
    });
    setQuestionFormError(null);
    setQuestionFormOpen(true);
    if (accessToken) {
      getSubjects(accessToken).then(setQuestionSubjects).catch(() => setQuestionSubjects([]));
      getTopicsBySubject(accessToken, q.subjectId).then(setQuestionFormTopics).catch(() => setQuestionFormTopics([]));
    }
  };

  useEffect(() => {
    if (!accessToken || !questionForm.subjectId || !questionFormOpen) return;
    getTopicsBySubject(accessToken, questionForm.subjectId).then(setQuestionFormTopics).catch(() => setQuestionFormTopics([]));
  }, [accessToken, questionForm.subjectId, questionFormOpen]);

  const updateQuestionOption = (idx: number, field: keyof OptionDraft, value: string | boolean) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === idx ? { ...o, [field]: value } : o)),
    }));
  };
  const addQuestionOption = () => {
    setQuestionForm((prev) => ({
      ...prev,
      options: [...prev.options, emptyOption(prev.options.length + 1)],
    }));
  };
  const removeQuestionOption = (idx: number) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx).map((o, i) => ({ ...o, sequenceNumber: i + 1 })),
    }));
  };

  const handleQuestionSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!questionForm.tryoutId || !questionForm.subjectId || !questionForm.sequenceNumber || !questionForm.text) {
      setQuestionFormError('Tryout, Subject, Sequence Number, dan Question text wajib diisi.');
      return;
    }
    if (!questionForm.options.some((o) => o.isCorrect)) {
      setQuestionFormError('Minimal satu pilihan harus ditandai sebagai jawaban benar.');
      return;
    }
    if (questionForm.options.some((o) => !o.text.trim())) {
      setQuestionFormError('Semua pilihan harus diisi.');
      return;
    }
    setQuestionSaving(true);
    setQuestionFormError(null);
    try {
      if (questionEditingId) {
        const { tryoutId: _t, ...rest } = questionFormToPayload(questionForm);
        await updateQuestion(accessToken, questionEditingId, rest);
      } else {
        await createQuestion(accessToken, questionFormToPayload(questionForm));
      }
      setQuestionFormOpen(false);
      await refreshPreviewQuestions();
    } catch (e) {
      setQuestionFormError(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleQuestionDelete = async () => {
    if (!accessToken || !deleteQuestionId) return;
    try {
      await deleteQuestion(accessToken, deleteQuestionId);
      setDeleteQuestionId(null);
      await refreshPreviewQuestions();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus soal');
      setDeleteQuestionId(null);
    }
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

  const filteredTryouts = tryouts.filter((t) => {
    const typeMatch = filterType === 'all' ? true : t.type === filterType;
    const titleMatch = !searchTitle.trim() || t.title.toLowerCase().includes(searchTitle.trim().toLowerCase());
    return typeMatch && titleMatch;
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pt-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="search"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Cari judul tryout..."
              className="flex-1 min-w-0 max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 placeholder:text-slate-400"
              aria-label="Cari judul tryout"
            />
            <span className="text-xs text-slate-500 shrink-0">
              Filter:
              <span className="ml-2 font-medium text-slate-700">
                {filterType === 'all'
                  ? 'Semua tipe'
                  : filterType === 'simulation'
                  ? 'Simulation'
                  : 'Practice'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500" htmlFor="tryout-type-filter">
              Tipe
            </label>
            <select
              id="tryout-type-filter"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | 'simulation' | 'practice')
              }
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <option value="all">Semua</option>
              <option value="simulation">Simulation</option>
              <option value="practice">Practice</option>
            </select>
          </div>
        </div>
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
            ) : filteredTryouts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  Belum ada tryout. Klik &quot;New Tryout&quot; untuk membuat.
                </td>
              </tr>
            ) : (
              filteredTryouts.map((t) => (
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
                        onClick={() => openPreview(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-brand-light hover:text-brand-dark transition-colors"
                        title="Preview soal & jawaban"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
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
                      <button
                        type="button"
                        onClick={() => setDeleteId(t.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Hapus tryout"
                      >
                        <Trash2 className="h-4 w-4" />
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

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Hapus tryout?</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Tryout ini akan dihapus permanen dari sistem beserta semua soalnya.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!accessToken || !deleteId) return;
                    try {
                      await deleteTryout(accessToken, deleteId);
                      setDeleteId(null);
                      loadTryouts();
                    } catch (e) {
                      // Kalau gagal, tampilkan error global
                      setError(e instanceof Error ? e.message : 'Gagal menghapus tryout');
                      setDeleteId(null);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tryout Modal */}
      {previewTryout && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-semibold text-brand-dark">
                Preview: {previewTryout.title}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openCreateQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-primary text-white hover:bg-brand-dark transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Soal
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTryout(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto flex-1 min-h-0">
              {previewLoading ? (
                <p className="text-sm text-slate-500 py-8 text-center">Memuat soal…</p>
              ) : previewQuestions.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm text-slate-500">Belum ada soal di tryout ini.</p>
                  <button
                    type="button"
                    onClick={openCreateQuestion}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Soal Pertama
                  </button>
                  <p className="text-xs text-slate-400">
                    Atau{' '}
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/questions?tryoutId=${encodeURIComponent(previewTryout.id)}`)}
                      className="text-brand-primary hover:text-brand-dark font-medium"
                    >
                      kelola di section Question
                    </button>
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {previewQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary text-xs font-bold">
                          {q.sequenceNumber}
                        </span>
                        <div className="min-w-0 flex-1 text-sm text-slate-800 leading-relaxed">
                          <LatexText>{q.text}</LatexText>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditQuestion(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-brand-light hover:text-brand-dark transition-colors"
                            title="Edit soal"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteQuestionId(q.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Hapus soal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {q.imageUrl && (
                        <div className="ml-9">
                          <img src={q.imageUrl} alt="" className="max-w-full h-auto rounded-lg border border-slate-200" />
                        </div>
                      )}
                      <ul className="ml-9 space-y-2">
                        {q.options
                          .slice()
                          .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                          .map((opt) => (
                            <li
                              key={opt.id}
                              className={opt.isCorrect
                                ? 'flex items-center gap-2 rounded-lg border-2 border-green-300 bg-green-50 px-3 py-2 text-sm text-slate-800'
                                : 'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700'
                              }
                            >
                              {opt.isCorrect && (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                              )}
                              <span className="font-medium text-slate-500 w-5 shrink-0">
                                {String.fromCharCode(64 + opt.sequenceNumber)}.
                              </span>
                              <span className="min-w-0 flex-1">
                                <LatexText>{opt.text}</LatexText>
                              </span>
                              {opt.isCorrect && (
                                <span className="shrink-0 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                  Jawaban benar
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!previewLoading && previewQuestions.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span>Total {previewQuestions.length} soal</span>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/questions?tryoutId=${encodeURIComponent(previewTryout.id)}`)}
                  className="text-brand-primary hover:text-brand-dark font-medium"
                >
                  Kelola di section Question →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Question confirmation (from preview) */}
      {deleteQuestionId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Hapus soal?</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Soal ini akan dihapus permanen beserta semua pilihan jawabannya. Data juga akan terupdate di section Question.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteQuestionId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleQuestionDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Question modal (from preview) */}
      {questionFormOpen && previewTryout && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-brand-dark">
                {questionEditingId ? 'Edit Question' : 'Tambah Soal'}
              </h2>
              <button
                type="button"
                onClick={() => setQuestionFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleQuestionSave} className="p-5 space-y-4">
              {questionFormError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {questionFormError}
                </div>
              )}

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <span className="text-xs font-medium text-slate-500">Tryout</span>
                <p className="font-medium">{previewTryout.title}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sequence Number <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={questionForm.sequenceNumber}
                    onChange={(e) => setQuestionForm((p) => ({ ...p, sequenceNumber: e.target.value }))}
                    required
                    placeholder="1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Subject <span className="text-red-500">*</span></label>
                  <select
                    value={questionForm.subjectId}
                    onChange={(e) => setQuestionForm((p) => ({ ...p, subjectId: e.target.value, topicId: '' }))}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="">— Pilih Subject —</option>
                    {questionSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
                  <select
                    value={questionForm.topicId}
                    onChange={(e) => setQuestionForm((p) => ({ ...p, topicId: e.target.value }))}
                    disabled={!questionForm.subjectId || questionFormTopics.length === 0}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-50"
                  >
                    <option value="">— Opsional —</option>
                    {questionFormTopics.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Question Text <span className="text-red-500">*</span></label>
                <textarea
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, text: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Tulis soal di sini."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
                <p className="mt-1 text-xs text-slate-500">
                  LaTeX: <code className="bg-slate-100 px-1 rounded">$rumus$</code> inline; <code className="bg-slate-100 px-1 rounded">$$rumus$$</code> atau <code className="bg-slate-100 px-1 rounded">\[rumus\]</code> blok.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Image URL (opsional)</label>
                <input
                  type="url"
                  value={questionForm.imageUrl}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Penjelasan (opsional)</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, explanation: e.target.value }))}
                  rows={2}
                  placeholder="Pembahasan jawaban..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600">Pilihan Jawaban <span className="text-red-500">*</span></label>
                  <button type="button" onClick={addQuestionOption} className="text-xs text-brand-primary hover:text-brand-dark font-medium flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Tambah pilihan
                  </button>
                </div>
                <div className="space-y-2">
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="mt-2 text-xs font-semibold text-slate-400 w-5 shrink-0 text-center">{String.fromCharCode(65 + idx)}.</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateQuestionOption(idx, 'text', e.target.value)}
                        placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                      <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => updateQuestionOption(idx, 'isCorrect', e.target.checked)}
                          className="accent-brand-primary w-4 h-4"
                        />
                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">Benar</span>
                      </label>
                      {questionForm.options.length > 2 && (
                        <button type="button" onClick={() => removeQuestionOption(idx)} className="mt-2 p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setQuestionFormOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" disabled={questionSaving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-60">
                  <Save className="h-4 w-4" />
                  {questionSaving ? 'Menyimpan…' : questionEditingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

