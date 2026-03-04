import { useCallback, useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronUp, X, Save, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getSubjects,
  createSubject,
  getTopicsBySubject,
  createTopic,
  type SubjectData,
  type TopicData,
} from '../../../lib/api';

export function AdminSubjectsPage() {
  const { accessToken } = useAuth();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [topics, setTopics] = useState<Record<string, TopicData[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New subject modal
  const [newSubjectModal, setNewSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [savingSubject, setSavingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // New topic modal
  const [newTopicSubjectId, setNewTopicSubjectId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [savingTopic, setSavingTopic] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const subs = await getSubjects(accessToken);
      setSubjects(subs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat subjects');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const toggleExpand = async (subjectId: string) => {
    const willExpand = !expanded[subjectId];
    setExpanded((prev) => ({ ...prev, [subjectId]: willExpand }));
    if (willExpand && !topics[subjectId] && accessToken) {
      try {
        const t = await getTopicsBySubject(accessToken, subjectId);
        setTopics((prev) => ({ ...prev, [subjectId]: t }));
      } catch {
        setTopics((prev) => ({ ...prev, [subjectId]: [] }));
      }
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newSubjectName.trim()) return;
    setSavingSubject(true);
    setSubjectError(null);
    try {
      await createSubject(accessToken, {
        name: newSubjectName.trim(),
        ...(newSubjectDesc.trim() ? { description: newSubjectDesc.trim() } : {}),
      });
      setNewSubjectModal(false);
      setNewSubjectName('');
      setNewSubjectDesc('');
      loadSubjects();
    } catch (e) {
      setSubjectError(e instanceof Error ? e.message : 'Gagal membuat subject');
    } finally {
      setSavingSubject(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newTopicSubjectId || !newTopicName.trim()) return;
    setSavingTopic(true);
    setTopicError(null);
    try {
      const newTopic = await createTopic(accessToken, newTopicSubjectId, {
        name: newTopicName.trim(),
      });
      if (newTopic) {
        setTopics((prev) => ({
          ...prev,
          [newTopicSubjectId]: [...(prev[newTopicSubjectId] ?? []), newTopic],
        }));
      }
      setNewTopicSubjectId(null);
      setNewTopicName('');
    } catch (e) {
      setTopicError(e instanceof Error ? e.message : 'Gagal membuat topic');
    } finally {
      setSavingTopic(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark">Subjects & Topics</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola mata pelajaran dan topik soal</p>
        </div>
        <button
          onClick={() => {
            setNewSubjectModal(true);
            setNewSubjectName('');
            setNewSubjectDesc('');
            setSubjectError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-brand-light p-8 text-center text-slate-500 shadow-sm">
          Memuat…
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-light p-8 text-center text-slate-400 shadow-sm">
          Belum ada subject. Klik "Add Subject" untuk memulai.
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-brand-light shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(subject.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-light rounded-xl">
                    <BookOpen className="h-4 w-4 text-brand-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-brand-dark">{subject.name}</div>
                    {subject.description && (
                      <div className="text-xs text-slate-500 mt-0.5">{subject.description}</div>
                    )}
                  </div>
                </div>
                {expanded[subject.id]
                  ? <ChevronUp className="h-4 w-4 text-slate-400" />
                  : <ChevronDown className="h-4 w-4 text-slate-400" />
                }
              </button>

              {expanded[subject.id] && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Topics</h3>
                    <button
                      onClick={() => {
                        setNewTopicSubjectId(subject.id);
                        setNewTopicName('');
                        setTopicError(null);
                      }}
                      className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-dark font-medium transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Topic
                    </button>
                  </div>

                  {/* Inline add topic form */}
                  {newTopicSubjectId === subject.id && (
                    <form onSubmit={handleCreateTopic} className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        placeholder="Nama topic baru…"
                        autoFocus
                        className="flex-1 rounded-xl border border-brand-primary/40 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                      <button
                        type="submit"
                        disabled={savingTopic || !newTopicName.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-dark disabled:opacity-60 transition-colors"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingTopic ? 'Simpan…' : 'Simpan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTopicSubjectId(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {topicError && (
                        <span className="text-xs text-red-600">{topicError}</span>
                      )}
                    </form>
                  )}

                  {topics[subject.id]?.length === 0 ? (
                    <p className="text-sm text-slate-400 py-2">Belum ada topic di subject ini.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(topics[subject.id] ?? []).map((topic) => (
                        <span
                          key={topic.id}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-brand-light text-brand-dark text-xs font-medium border border-brand-light"
                        >
                          {topic.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Subject Modal */}
      {newSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-brand-dark">Tambah Subject Baru</h2>
              <button
                onClick={() => setNewSubjectModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-5 space-y-4">
              {subjectError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {subjectError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nama Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  required
                  placeholder="Contoh: Mathematics, Physics…"
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Deskripsi (opsional)</label>
                <textarea
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  rows={2}
                  placeholder="Deskripsi singkat…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setNewSubjectModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingSubject || !newSubjectName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-60 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {savingSubject ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
