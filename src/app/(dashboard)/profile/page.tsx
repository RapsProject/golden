import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, CreditCard, Phone, Save, School, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getMyProfile,
  getSubscriptionPlans,
  updateMyProfile,
  type ProfileDetail,
  type SubscriptionPlan,
} from '../../../lib/api';

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function subscriptionBadgeClass(status: string) {
  if (status === 'active') return 'bg-green-100 text-green-700 border border-green-200';
  if (status === 'expired') return 'bg-red-100 text-red-700 border border-red-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
}

export function ProfilePage() {
  const { user: authUser, accessToken } = useAuth();
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [dreamMajor, setDreamMajor] = useState('');
  const [schoolOrigin, setSchoolOrigin] = useState('');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    getMyProfile(accessToken)
      .then((data) => {
        if (!cancelled && data) {
          setProfile(data);
          setPhoneNumber(data.phoneNumber ?? '');
          setDreamMajor(data.dreamMajor ?? '');
          setSchoolOrigin(data.schoolOrigin ?? '');
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;
    getSubscriptionPlans()
      .then((data) => {
        if (!cancelled) {
          setPlans((data ?? []).filter((p) => p.name !== 'Free'));
        }
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const updated = await updateMyProfile(accessToken, { phoneNumber, dreamMajor, schoolOrigin });
      if (updated) setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.fullName ?? authUser?.email ?? 'User';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  const avatarUrl = authUser?.user_metadata?.avatar_url as string | undefined;
  const activeSub = profile?.subscriptions?.[0];

  // Urutan plan: Free < Premium < Ultimate. Hanya tampilkan opsi upgrade ke plan di atas saat ini.
  const PLAN_ORDER = ['Free', 'Premium', 'Ultimate'] as const;
  const currentPlanName = activeSub?.plan?.name ?? 'Free';
  const currentLevel = PLAN_ORDER.indexOf(currentPlanName as (typeof PLAN_ORDER)[number]);
  const upgradePlans = plans.filter(
    (p) => PLAN_ORDER.indexOf(p.name as (typeof PLAN_ORDER)[number]) > currentLevel
  );
  const isHighestPlan = currentPlanName === 'Ultimate';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header: avatar + name + subscription badge */}
      <div className="bg-white rounded-2xl border border-brand-light p-6 shadow-sm">
        <div className="flex items-center gap-5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover border-2 border-brand-light shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-brand-primary text-white flex items-center justify-center text-2xl font-bold shrink-0">
              {initials || <User className="h-8 w-8" />}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xl font-serif font-bold text-brand-dark truncate">
              {loading ? '—' : displayName}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              {profile?.email ?? authUser?.email ?? '—'}
            </div>
            {!loading && (
              <span
                className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  activeSub
                    ? subscriptionBadgeClass(activeSub.status)
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {activeSub ? activeSub.plan.name : 'Free Plan'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subscription detail */}
      {activeSub && (
        <div className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm">
          <h2 className="text-base font-semibold text-brand-dark mb-3">Subscription</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Plan</div>
              <div className="font-medium text-slate-800">{activeSub.plan.name}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Status</div>
              <div
                className={`font-semibold capitalize ${
                  activeSub.status === 'active' ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {activeSub.status}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Active since</div>
              <div className="font-medium text-slate-800">
                {formatDate(activeSub.startDate)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Expires on</div>
              <div className="font-medium text-slate-800">
                {formatDate(activeSub.endDate)}
              </div>
            </div>
        </div>
      </div>
      )}

      {/* Upgrade subscription */}
      <div className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm">
        <h2 className="text-base font-semibold text-brand-dark mb-1 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-primary" />
          Upgrade subscription
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {isHighestPlan
            ? 'Anda sudah pada plan tertinggi.'
            : 'Akses penuh Analytics, Leaderboard, dan bank soal lengkap.'}
        </p>
        {plansLoading ? (
          <p className="text-sm text-slate-400 py-2">Memuat paket…</p>
        ) : isHighestPlan ? (
          <p className="text-sm text-slate-600 py-2">
            Tidak ada opsi upgrade—plan Ultimate sudah mencakup semua fitur.
          </p>
        ) : upgradePlans.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">Tidak ada paket berbayar tersedia.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upgradePlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border border-brand-light p-4 hover:border-brand-primary/50 transition-colors"
              >
                <div className="font-semibold text-brand-dark">{plan.name}</div>
                <div className="mt-1 text-lg font-bold text-brand-primary">
                  {plan.price === 0
                    ? 'Gratis'
                    : `IDR ${(plan.price / 1000).toFixed(0)}K`}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {plan.durationDays} hari
                </div>
                <Link
                  to="/subscription"
                  className="mt-3 block w-full rounded-lg bg-brand-primary py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
                >
                  Upgrade
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editable fields */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-brand-light p-5 shadow-sm space-y-5"
      >
        <h2 className="text-base font-semibold text-brand-dark">Edit Profile</h2>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        {saveSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Profile berhasil disimpan!
          </div>
        )}

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
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
          />
        </div>

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
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
            <BookOpen className="h-4 w-4 text-brand-primary" />
            Jurusan Impian IUP ITB
          </label>
          <select
            value={dreamMajor}
            onChange={(e) => setDreamMajor(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
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
          disabled={saving || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
