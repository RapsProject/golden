import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Save, ToggleLeft, ToggleRight, X, AlertCircle, Settings2, Trash2, Eye, CheckCircle2, Upload, Link, ImageIcon, PenLine } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { QuestionTextRenderer } from '../../../components/QuestionTextRenderer';
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
  isUltimate: boolean;
  isPublished: boolean;
};

const emptyForm = (): FormState => ({
  title: '',
  type: 'simulation',
  durationMinutes: '120',
  maxAttempts: '',
  isPremium: false,
  isUltimate: false,
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
  const [questionPreviewMode, setQuestionPreviewMode] = useState(false);
  const [questionEditingId, setQuestionEditingId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(emptyQuestionForm(''));
  const [questionSubjects, setQuestionSubjects] = useState<SubjectData[]>([]);
  const [questionFormTopics, setQuestionFormTopics] = useState<TopicData[]>([]);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [questionFormError, setQuestionFormError] = useState<string | null>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [qImageUploading, setQImageUploading] = useState(false);
  const qImageFileRef = useRef<HTMLInputElement>(null);
  const [qOptionImageUploading, setQOptionImageUploading] = useState<number | null>(null);
  const qOptionFileRef = useRef<HTMLInputElement>(null);
  const qCurrentOptionIdxRef = useRef<number>(-1);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? '';

  const uploadQImageFile = async (file: File): Promise<string | null> => {
    if (file.size > 100 * 1024) {
      setQuestionFormError(`Ukuran gambar terlalu besar. Maksimal 100KB (${(file.size / 1024).toFixed(1)}KB).`);
      return null;
    }
    if (!accessToken) { setQuestionFormError('Sesi tidak ditemukan. Silakan login ulang.'); return null; }
    setQImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/v1/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) { setQuestionFormError(json?.message ?? 'Gagal mengupload gambar.'); return null; }
      return (json?.data?.url as string) ?? null;
    } catch {
      setQuestionFormError('Gagal mengupload gambar. Periksa koneksi ke server.');
      return null;
    } finally {
      setQImageUploading(false);
    }
  };

  const handleQTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageItem = Array.from(e.clipboardData.items).find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    const url = await uploadQImageFile(file);
    if (url) setQuestionForm((p) => ({ ...p, imageUrl: url }));
  };

  const handleQImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadQImageFile(file);
    if (url) setQuestionForm((p) => ({ ...p, imageUrl: url }));
    e.target.value = '';
  };

  const uploadQOptionImage = async (file: File, idx: number): Promise<void> => {
    if (file.size > 100 * 1024) {
      setQuestionFormError(`Ukuran gambar pilihan ${String.fromCharCode(65 + idx)} terlalu besar. Maks 100KB (${(file.size / 1024).toFixed(1)}KB).`);
      return;
    }
    if (!accessToken) { setQuestionFormError('Sesi tidak ditemukan.'); return; }
    setQOptionImageUploading(idx);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/v1/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) { setQuestionFormError(json?.message ?? 'Gagal mengupload gambar pilihan.'); return; }
      const url = (json?.data?.url as string) ?? '';
      if (url) updateQuestionOption(idx, 'imageUrl', url);
    } catch {
      setQuestionFormError('Gagal mengupload gambar pilihan. Periksa koneksi ke server.');
    } finally {
      setQOptionImageUploading(null);
    }
  };

  const handleQOptionFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const idx = qCurrentOptionIdxRef.current;
    if (!file || idx < 0) return;
    await uploadQOptionImage(file, idx);
    e.target.value = '';
  };

  const handleQOptionPaste = async (e: React.ClipboardEvent<HTMLInputElement>, idx: number) => {
    const imageItem = Array.from(e.clipboardData.items).find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    await uploadQOptionImage(file, idx);
  };

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
      isUltimate: t.isUltimate,
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
    const nextSeq = previewQuestions.length > 0
      ? Math.max(...previewQuestions.map((q) => q.sequenceNumber)) + 1
      : 1;
    setQuestionEditingId(null);
    setQuestionForm({ ...emptyQuestionForm(previewTryout.id), sequenceNumber: String(nextSeq) });
    setQuestionFormError(null);
    setQuestionFormTopics([]);
    setQImageUploading(false);
    setQOptionImageUploading(null);
    setQuestionPreviewMode(false);
    setQuestionFormOpen(true);
    if (accessToken) {
      getSubjects(accessToken).then(setQuestionSubjects).catch(() => setQuestionSubjects([]));
    }
  };

  const openEditQuestion = async (q: QuestionData) => {
    setQImageUploading(false);
    setQOptionImageUploading(null);
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
    setQuestionPreviewMode(false);
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
    if (questionForm.options.some((o) => !o.text.trim() && !o.imageUrl.trim())) {
      setQuestionFormError('Semua pilihan harus diisi (teks atau gambar).');
      return;
    }
    setQuestionSaving(true);
    setQuestionFormError(null);
    try {
      if (questionEditingId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      isUltimate: form.isUltimate,
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
                    {t.isPremium || t.isUltimate ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {t.isPremium ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Premium
                          </span>
                        ) : null}
                        {t.isUltimate ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                            Ultimate
                          </span>
                        ) : null}
                      </div>
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
                    <span>Premium</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isUltimate}
                      onChange={(e) => setForm((p) => ({ ...p, isUltimate: e.target.checked }))}
                      className="accent-brand-primary w-4 h-4"
                    />
                    <span>Ultimate</span>
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
                          <QuestionTextRenderer
                            text={q.text}
                            imageUrl={q.imageUrl}
                            className="text-sm text-slate-800 leading-relaxed"
                            imgClassName="mt-3 max-h-56 max-w-full rounded-lg border border-slate-200 bg-white object-contain"
                          />
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
                      <ul className="ml-9 space-y-2">
                        {q.options
                          .slice()
                          .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                          .map((opt) => (
                            <li
                              key={opt.id}
                              className={opt.isCorrect
                                ? 'flex items-start gap-2 rounded-lg border-2 border-green-300 bg-green-50 px-3 py-2 text-sm text-slate-800'
                                : 'flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700'
                              }
                            >
                              {opt.isCorrect && (
                                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" aria-hidden />
                              )}
                              <span className="font-medium text-slate-500 w-5 shrink-0 mt-0.5">
                                {String.fromCharCode(64 + opt.sequenceNumber)}.
                              </span>
                              <div className="min-w-0 flex-1">
                                {opt.text ? (
                                  <span><LatexText>{opt.text}</LatexText></span>
                                ) : null}
                                {opt.imageUrl ? (
                                  <img
                                    src={opt.imageUrl}
                                    alt={`Pilihan ${String.fromCharCode(64 + opt.sequenceNumber)}`}
                                    className="mt-1.5 max-h-28 max-w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
                                  />
                                ) : null}
                                {!opt.text && !opt.imageUrl ? (
                                  <span className="text-slate-400 italic text-xs">—</span>
                                ) : null}
                              </div>
                              {opt.isCorrect && (
                                <span className="shrink-0 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded mt-0.5">
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
              <div className="flex items-center gap-2">
                {/* Edit / Preview toggle */}
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setQuestionPreviewMode(false)}
                    className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${!questionPreviewMode ? 'bg-brand-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <PenLine className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionPreviewMode(true)}
                    className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${questionPreviewMode ? 'bg-brand-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setQuestionFormOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── PREVIEW panel ── */}
            {questionPreviewMode && (
              <div className="p-5 space-y-5">
                {/* Question text + image */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Soal</p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-800 leading-relaxed min-h-[60px]">
                    {questionForm.text ? (
                      <QuestionTextRenderer
                        text={questionForm.text}
                        imageUrl={questionForm.imageUrl || null}
                        className="text-sm text-slate-800 leading-relaxed"
                        imgClassName="mt-3 max-h-56 max-w-full rounded-lg border border-slate-200 bg-white object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 italic">Teks soal belum diisi…</span>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pilihan Jawaban</p>
                  <div className="space-y-2">
                    {questionForm.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-sm ${opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'}`}
                      >
                        <span className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="min-w-0">
                          {opt.text ? (
                            <span className={opt.isCorrect ? 'text-green-800 font-medium' : 'text-slate-700'}><LatexText>{opt.text}</LatexText></span>
                          ) : null}
                          {opt.imageUrl ? (
                            <img
                              src={opt.imageUrl}
                              alt={`Pilihan ${String.fromCharCode(65 + idx)}`}
                              className="mt-2 max-h-28 max-w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
                            />
                          ) : null}
                          {!opt.text && !opt.imageUrl ? (
                            <span className="text-slate-400 italic">Kosong</span>
                          ) : null}
                        </div>
                        {opt.isCorrect && (
                          <span className="ml-auto shrink-0 text-xs font-semibold text-green-600 bg-green-100 rounded-full px-2 py-0.5">Benar</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                {questionForm.explanation && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pembahasan</p>
                    <div className="rounded-xl border border-slate-100 bg-amber-50 px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                      <LatexText>{questionForm.explanation}</LatexText>
                    </div>
                  </div>
                )}

                {/* Save button still accessible from preview */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setQuestionPreviewMode(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    ← Kembali Edit
                  </button>
                  <button
                    type="button"
                    disabled={questionSaving}
                    onClick={(e) => { setQuestionPreviewMode(false); handleQuestionSave(e as unknown as React.FormEvent); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {questionSaving ? 'Menyimpan…' : questionEditingId ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleQuestionSave} className={`p-5 space-y-4 ${questionPreviewMode ? 'hidden' : ''}`}>
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
                  onPaste={handleQTextareaPaste}
                  required
                  rows={4}
                  placeholder="Tulis soal di sini. Paste gambar langsung ke sini untuk menambahkan gambar."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
                <p className="mt-1 text-xs text-slate-500">
                  LaTeX: <code className="bg-slate-100 px-1 rounded">$rumus$</code> inline; <code className="bg-slate-100 px-1 rounded">$$rumus$$</code> atau <code className="bg-slate-100 px-1 rounded">\[rumus\]</code> blok.
                  {' '}Kamu juga bisa <strong>paste gambar</strong> langsung ke kolom ini.
                  {' '}Gunakan <code className="bg-slate-100 px-1 rounded">[img]</code> di teks untuk menempatkan gambar inline.
                </p>
              </div>

              {/* Image section */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                  <ImageIcon className="h-3.5 w-3.5" /> Gambar Soal (opsional)
                </label>
                <div
                  className="mb-2 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-colors cursor-pointer"
                  onClick={() => qImageFileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
                    if (!file) return;
                    const url = await uploadQImageFile(file);
                    if (url) setQuestionForm((p) => ({ ...p, imageUrl: url }));
                  }}
                >
                  {qImageUploading ? (
                    <span className="flex items-center gap-2 text-brand-primary font-medium">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Mengupload…
                    </span>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 shrink-0" />
                      <span>Klik untuk pilih file, atau drag &amp; drop. Maks 100KB.</span>
                    </>
                  )}
                </div>
                <input ref={qImageFileRef} type="file" accept="image/*" className="hidden" onChange={handleQImageFileChange} />
                {questionForm.imageUrl && !qImageUploading && (
                  <div className="mb-2 relative inline-block rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={questionForm.imageUrl} alt="Preview soal" className="max-h-40 max-w-full object-contain block" />
                    <button
                      type="button"
                      onClick={() => setQuestionForm((p) => ({ ...p, imageUrl: '' }))}
                      className="absolute top-1 right-1 rounded-full bg-white/80 p-0.5 text-slate-500 hover:bg-red-50 hover:text-red-500 border border-slate-200 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <Link className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-400">Atau masukkan URL gambar secara manual:</span>
                </div>
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

                {/* Hidden file input shared across all options */}
                <input ref={qOptionFileRef} type="file" accept="image/*" className="hidden" onChange={handleQOptionFileChange} />

                <div className="space-y-3">
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 space-y-2">
                      {/* Row 1: label + text + correct + remove */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 w-5 shrink-0 text-center">{String.fromCharCode(65 + idx)}.</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateQuestionOption(idx, 'text', e.target.value)}
                          onPaste={(e) => handleQOptionPaste(e, idx)}
                          placeholder={`Teks pilihan ${String.fromCharCode(65 + idx)} (atau paste gambar di sini)`}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                        <label className="flex items-center gap-1 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={opt.isCorrect}
                            onChange={(e) => updateQuestionOption(idx, 'isCorrect', e.target.checked)}
                            className="accent-brand-primary w-4 h-4"
                          />
                          <span className="text-xs text-green-600 font-medium">Benar</span>
                        </label>
                        {questionForm.options.length > 2 && (
                          <button type="button" onClick={() => removeQuestionOption(idx)} className="p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 shrink-0">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {/* Row 2: image section */}
                      <div className="pl-7">
                        {opt.imageUrl ? (
                          <div className="flex items-start gap-2">
                            <div className="relative inline-block rounded-lg overflow-hidden border border-slate-200 bg-white">
                              {qOptionImageUploading === idx ? (
                                <div className="flex items-center justify-center gap-1.5 h-16 w-24 text-xs text-brand-primary">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                  </svg>
                                </div>
                              ) : (
                                <img src={opt.imageUrl} alt={`Pilihan ${String.fromCharCode(65 + idx)}`} className="max-h-24 max-w-[160px] object-contain block" />
                              )}
                              <button type="button" onClick={() => updateQuestionOption(idx, 'imageUrl', '')} className="absolute top-0.5 right-0.5 rounded-full bg-white/80 p-0.5 text-slate-500 hover:bg-red-50 hover:text-red-500 border border-slate-200">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button type="button" onClick={() => { qCurrentOptionIdxRef.current = idx; qOptionFileRef.current?.click(); }} className="text-xs text-brand-primary hover:text-brand-dark flex items-center gap-1">
                                <Upload className="h-3 w-3" /> Ganti gambar
                              </button>
                              <input type="url" value={opt.imageUrl} onChange={(e) => updateQuestionOption(idx, 'imageUrl', e.target.value)} placeholder="URL gambar…" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30 w-48" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {qOptionImageUploading === idx ? (
                              <span className="flex items-center gap-1.5 text-xs text-brand-primary">
                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Mengupload…
                              </span>
                            ) : (
                              <button type="button" onClick={() => { qCurrentOptionIdxRef.current = idx; qOptionFileRef.current?.click(); }} className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-primary transition-colors">
                                <ImageIcon className="h-3.5 w-3.5" /> Tambah gambar
                              </button>
                            )}
                            <span className="text-slate-300 text-xs">|</span>
                            <input type="url" value={opt.imageUrl} onChange={(e) => updateQuestionOption(idx, 'imageUrl', e.target.value)} placeholder="atau paste URL gambar…" className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                          </div>
                        )}
                      </div>
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

