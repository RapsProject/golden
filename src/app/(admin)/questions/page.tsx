import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Save, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getQuestions,
  getSubjects,
  getTopicsBySubject,
  getTryoutOptions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionData,
  type SubjectData,
  type TopicData,
  type TryoutOption,
  type CreateQuestionInput,
} from '../../../lib/api';
import { LatexText } from '../../../components/LatexText';

type OptionDraft = {
  sequenceNumber: number;
  text: string;
  imageUrl: string;
  isCorrect: boolean;
};

const emptyOption = (seq: number): OptionDraft => ({
  sequenceNumber: seq,
  text: '',
  imageUrl: '',
  isCorrect: false,
});

type FormState = {
  tryoutId: string;
  subjectId: string;
  topicId: string;
  sequenceNumber: string;
  text: string;
  imageUrl: string;
  explanation: string;
  options: OptionDraft[];
};

const emptyForm = (): FormState => ({
  tryoutId: '',
  subjectId: '',
  topicId: '',
  sequenceNumber: '',
  text: '',
  imageUrl: '',
  explanation: '',
  options: [emptyOption(1), emptyOption(2), emptyOption(3), emptyOption(4)],
});

function formToPayload(form: FormState): CreateQuestionInput {
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

export function AdminQuestionsPage() {
  const { accessToken } = useAuth();
  const location = useLocation();
  const tryoutIdFromUrl = new URLSearchParams(location.search).get('tryoutId') ?? '';

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [tryouts, setTryouts] = useState<TryoutOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters (filter tryout diisi dari URL bila ada ?tryoutId=)
  const [filterTryoutType, setFilterTryoutType] = useState<'all' | 'simulation' | 'practice'>('all');
  const [filterTryout, setFilterTryout] = useState(tryoutIdFromUrl);
  const [tryoutSearchInput, setTryoutSearchInput] = useState('');
  const [tryoutDropdownOpen, setTryoutDropdownOpen] = useState(false);
  const tryoutDropdownRef = useRef<HTMLDivElement>(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterTopics, setFilterTopics] = useState<TopicData[]>([]);

  useEffect(() => {
    if (tryoutIdFromUrl) setFilterTryout(tryoutIdFromUrl);
  }, [tryoutIdFromUrl]);

  // Set search input to selected tryout title when tryouts load and filterTryout is set
  useEffect(() => {
    if (filterTryout && tryouts.length > 0) {
      const selected = tryouts.find((t) => t.id === filterTryout);
      if (selected) setTryoutSearchInput(selected.title);
    }
  }, [filterTryout, tryouts.length]);

  // Close tryout dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tryoutDropdownRef.current && !tryoutDropdownRef.current.contains(e.target as Node)) {
        setTryoutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formTopics, setFormTopics] = useState<TopicData[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [qs, subs, tryoutList] = await Promise.all([
        getQuestions(accessToken, {
          ...(filterTryout ? { tryoutId: filterTryout } : {}),
          ...(filterSubject ? { subjectId: filterSubject } : {}),
          ...(filterTopic ? { topicId: filterTopic } : {}),
          limit: 200,
          includeInactive: true,
        }),
        getSubjects(accessToken),
        getTryoutOptions(accessToken),
      ]);
      setQuestions(qs);
      setSubjects(subs);
      setTryouts(tryoutList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [accessToken, filterTryout, filterSubject, filterTopic]);

  useEffect(() => { loadData(); }, [loadData]);

  // load filter topics when filter subject changes
  useEffect(() => {
    if (!accessToken || !filterSubject) { setFilterTopics([]); return; }
    getTopicsBySubject(accessToken, filterSubject).then(setFilterTopics).catch(() => setFilterTopics([]));
  }, [accessToken, filterSubject]);

  // load form topics when form subject changes
  useEffect(() => {
    if (!accessToken || !form.subjectId) { setFormTopics([]); return; }
    getTopicsBySubject(accessToken, form.subjectId).then(setFormTopics).catch(() => setFormTopics([]));
  }, [accessToken, form.subjectId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormTopics([]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (q: QuestionData) => {
    setEditingId(q.id);
    setForm({
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
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!form.tryoutId || !form.subjectId || !form.sequenceNumber || !form.text) {
      setFormError('Tryout, Subject, Sequence Number, dan Question text wajib diisi.');
      return;
    }
    if (!form.options.some((o) => o.isCorrect)) {
      setFormError('Minimal satu pilihan harus ditandai sebagai jawaban benar.');
      return;
    }
    if (form.options.some((o) => !o.text.trim())) {
      setFormError('Semua pilihan harus diisi.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        const { tryoutId: _t, ...rest } = formToPayload(form);
        await updateQuestion(accessToken, editingId, rest);
      } else {
        await createQuestion(accessToken, formToPayload(form));
      }
      setModalOpen(false);
      loadData();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    try {
      await deleteQuestion(accessToken, id);
      setDeleteConfirm(null);
      loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus');
    }
  };

  const handleToggleActive = async (q: QuestionData) => {
    if (!accessToken) return;
    try {
      await updateQuestion(accessToken, q.id, { isActive: !q.isActive });
      loadData();
    } catch {
      /* ignore */
    }
  };

  const updateOption = (idx: number, field: keyof OptionDraft, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) =>
        i === idx ? { ...o, [field]: value } : o,
      ),
    }));
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, emptyOption(prev.options.length + 1)],
    }));
  };

  const removeOption = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options
        .filter((_, i) => i !== idx)
        .map((o, i) => ({ ...o, sequenceNumber: i + 1 })),
    }));
  };

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const tryoutTitle = (id: string) => tryouts.find((t) => t.id === id)?.title ?? id;
  const topicName = (id: string | null) =>
    id ? (topics.find((t) => t.id === id)?.name ?? filterTopics.find((t) => t.id === id)?.name ?? id) : '—';

  // Flatten topics from all subjects for display
  useEffect(() => {
    if (!accessToken) return;
    Promise.all(subjects.map((s) => getTopicsBySubject(accessToken, s.id)))
      .then((all) => setTopics(all.flat()))
      .catch(() => {/* ignore */});
  }, [accessToken, subjects]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark">Questions</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola soal tryout</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-brand-light p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tipe</label>
            <select
              value={filterTryoutType}
              onChange={(e) => {
                setFilterTryoutType(e.target.value as 'all' | 'simulation' | 'practice');
                setFilterTryout('');
                setTryoutSearchInput('');
                setTryoutDropdownOpen(false);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <option value="all">Semua</option>
              <option value="simulation">Tryout (Simulation)</option>
              <option value="practice">Practice</option>
            </select>
          </div>
          <div className="relative" ref={tryoutDropdownRef}>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter Tryout / Practice</label>
            <div className="relative">
              <input
                type="text"
                value={tryoutSearchInput}
                onChange={(e) => {
                  setTryoutSearchInput(e.target.value);
                  setTryoutDropdownOpen(true);
                  if (filterTryout) setFilterTryout('');
                }}
                onFocus={() => setTryoutDropdownOpen(true)}
                placeholder="Ketik judul tryout atau practice..."
                className="w-full rounded-xl border border-slate-200 pl-3 pr-9 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 placeholder:text-slate-400"
                aria-label="Cari dan pilih tryout atau practice"
                aria-expanded={tryoutDropdownOpen}
                aria-autocomplete="list"
              />
              <button
                type="button"
                onClick={() => setTryoutDropdownOpen((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
                aria-label={tryoutDropdownOpen ? 'Tutup daftar' : 'Buka daftar'}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${tryoutDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {tryoutDropdownOpen && (
              <ul
                className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1 text-sm"
                role="listbox"
              >
                <li
                  role="option"
                  className="px-3 py-2 cursor-pointer text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    setFilterTryout('');
                    setTryoutSearchInput('');
                    setTryoutDropdownOpen(false);
                  }}
                >
                  Semua Tryout / Practice
                </li>
                {(() => {
                  const byType = tryouts.filter((t) => filterTryoutType === 'all' || t.type === filterTryoutType);
                  const filtered = byType.filter((t) =>
                    !tryoutSearchInput.trim() || t.title.toLowerCase().includes(tryoutSearchInput.trim().toLowerCase())
                  );
                  return (
                    <>
                      {filtered.map((t) => (
                        <li
                          key={t.id}
                          role="option"
                          className={`px-3 py-2 cursor-pointer hover:bg-slate-50 ${filterTryout === t.id ? 'bg-brand-light text-brand-dark font-medium' : 'text-slate-800'}`}
                          onClick={() => {
                            setFilterTryout(t.id);
                            setTryoutSearchInput(t.title);
                            setTryoutDropdownOpen(false);
                          }}
                        >
                          {t.title}
                          <span className="ml-2 text-xs text-slate-500 capitalize">({t.type})</span>
                        </li>
                      ))}
                      {byType.length > 0 && filtered.length === 0 && (
                        <li className="px-3 py-2 text-slate-500 italic">Tidak ada yang cocok</li>
                      )}
                    </>
                  );
                })()}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic(''); }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <option value="">Semua Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter Topic</label>
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              disabled={!filterSubject}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-50"
            >
              <option value="">Semua Topic</option>
              {filterTopics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tryout</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Topic</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Soal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Opsi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aktif</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">Memuat…</td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">Belum ada soal</td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{q.sequenceNumber}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">{tryoutTitle(q.tryoutId)}</td>
                  <td className="px-4 py-3 text-slate-600">{subjectName(q.subjectId)}</td>
                  <td className="px-4 py-3 text-slate-500">{topicName(q.topicId)}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-[220px]">
                    <span className="line-clamp-2"><LatexText>{q.text}</LatexText></span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{q.options.length} pilihan</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(q)}
                      className="text-brand-primary hover:text-brand-dark transition-colors"
                      title={q.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {q.isActive
                        ? <ToggleRight className="h-5 w-5 text-green-500" />
                        : <ToggleLeft className="h-5 w-5 text-slate-400" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-brand-light hover:text-brand-dark transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(q.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Hapus"
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
        {!loading && (
          <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-50">
            {questions.length} soal ditemukan
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Hapus soal?</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Soal ini akan dihapus permanen beserta semua pilihan jawabannya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-brand-dark">
                {editingId ? 'Edit Question' : 'Create Question'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Tryout <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.tryoutId}
                    onChange={(e) => setForm((p) => ({ ...p, tryoutId: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="">— Pilih Tryout —</option>
                    {tryouts.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Sequence Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.sequenceNumber}
                    onChange={(e) => setForm((p) => ({ ...p, sequenceNumber: e.target.value }))}
                    required
                    placeholder="1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.subjectId}
                    onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value, topicId: '' }))}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="">— Pilih Subject —</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
                  <select
                    value={form.topicId}
                    onChange={(e) => setForm((p) => ({ ...p, topicId: e.target.value }))}
                    disabled={!form.subjectId || formTopics.length === 0}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-50"
                  >
                    <option value="">— Opsional —</option>
                    {formTopics.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Tulis soal di sini."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Mendukung LaTeX: <code className="bg-slate-100 px-1 rounded">$rumus$</code> untuk inline, <code className="bg-slate-100 px-1 rounded">$$rumus$$</code> untuk rumus blok (contoh: <code className="bg-slate-100 px-1 rounded">$x^2$</code>, <code className="bg-slate-100 px-1 rounded">$$\frac{1}{2}$$</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Image URL (opsional)</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Penjelasan / Pembahasan (opsional)</label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
                  rows={3}
                  placeholder="Pembahasan jawaban..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Pilihan Jawaban <span className="text-red-500">*</span> <span className="font-normal text-slate-500"></span>
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-xs text-brand-primary hover:text-brand-dark font-medium flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah pilihan
                  </button>
                </div>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="mt-2 text-xs font-semibold text-slate-400 w-5 shrink-0 text-center">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOption(idx, 'text', e.target.value)}
                        placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                      <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => updateOption(idx, 'isCorrect', e.target.checked)}
                          className="accent-brand-primary w-4 h-4"
                        />
                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">Benar</span>
                      </label>
                      {form.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="mt-2 p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
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
