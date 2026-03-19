import { useState } from 'react';
import { BookOpen, Phone, School, Sparkles } from 'lucide-react';
import { updateMyProfile } from '../lib/api';

const DREAM_MAJORS = [
  "Geological Engineering (FITB)",
  "Geodesy and Geomatics Engineering (FITB)",
  "Actuarial Science",
  "Mathematics (FMIPA)",
  "Physics (FMIPA)",
  "Chemistry (FMIPA)",
  "Visual Communication Design (FSRD)",
  "Product Design (FSRD)",
  "Craft (FSRD)",
  "Engineering Physics (FTI)",
  "Industrian Engineering (FTI)",
  "Chemical Engineering (FTI)",
  "Aerospace Engineering (FTMD)",
  "Mechanical Engineering (FTMD)",
  "Environmental Engineering (FTSL)",
  "Metallurgical Engineering (FTTM)",
  "Architecture (SAPPK)",
  "Entrepreneurship (SBM)",
  "Management (SBM)",
  "Clinical and Community Pharmacy (SF)",
  "Pharmaceutical Science and Technology (SF)",
  "Biology - Marine and Coastal Biology (SITH)",
  "Biology - Biomedical Science (SITH)",
  "Information System and Technology (STEI)",
  "Informatics (STEI)",
  "Telecommunication Engineering(STEI)",
  "Electrical Power Engineering (STEI)",
  "Electrical Engineering (STEI)",
];

type Props = {
  accessToken: string;
  onClose: () => void;
};

export function OnboardingModal({ accessToken, onClose }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [schoolOrigin, setSchoolOrigin] = useState('');
  const [dreamMajor, setDreamMajor] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateMyProfile(accessToken, { phoneNumber, schoolOrigin, dreamMajor });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-[fade-in_0.2s_ease]">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-brand-primary" />
          </div>
          <h2 className="text-xl font-serif font-bold text-brand-dark">
            Selamat Datang!
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Sebelum memulai, lengkapi profil kamu agar perjalanan belajarmu lebih personal.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* No. Telepon */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
              <Phone className="h-4 w-4 text-brand-primary" />
              No. Telepon
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="08xxxxxxxxxx"
              pattern="[0-9+() -]*"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
            />
          </div>

          {/* Asal Sekolah */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
              <School className="h-4 w-4 text-brand-primary" />
              Asal Sekolah
            </label>
            <input
              type="text"
              value={schoolOrigin}
              onChange={(e) => setSchoolOrigin(e.target.value)}
              placeholder="Nama sekolah asal"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
            />
          </div>

          {/* Jurusan Impian */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
              <BookOpen className="h-4 w-4 text-brand-primary" />
              Jurusan Impian IUP ITB
            </label>
            <select
              value={dreamMajor}
              onChange={(e) => setDreamMajor(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
            >
              <option value="">-- Pilih jurusan impian --</option>
              {DREAM_MAJORS.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 mt-2"
          >
            {saving ? 'Menyimpan…' : 'Simpan & Mulai'}
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
        >
          Lewati untuk sekarang
        </button>
      </div>
    </div>
  );
}
