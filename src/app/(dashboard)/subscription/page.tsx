import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { getSubscriptionPlans, createSubscriptionTransaction, type SubscriptionPlan } from "../../../lib/api";

type PlanKey = "Premium" | "Ultimate";

const PLANS: {
  key: PlanKey;
  name: string;
  description: string;
  price: number;
  highlight?: boolean;
}[] = [
  {
    key: "Premium",
    name: "Premium",
    description: "Akses penuh bank soal, Analytics, dan Leaderboard",
    price: 69000,
  },
  {
    key: "Ultimate",
    name: "Ultimate",
    description: "Semua fitur Premium ditambah akses lebih banyak soal.",
    price: 99000,
    highlight: true,
  },
];

export function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("Premium");
  const [loading, setLoading] = useState(false);
  const [dbPlans, setDbPlans] = useState<SubscriptionPlan[]>([]);
  
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    getSubscriptionPlans().then(setDbPlans).catch(console.error);

    // Load Midtrans Snap Script
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true";
    const scriptUrl = isProd 
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    if (!document.getElementById("midtrans-snap-script")) {
      const script = document.createElement("script");
      script.id = "midtrans-snap-script";
      script.src = scriptUrl;
      script.setAttribute("data-client-key", clientKey || "");
      document.body.appendChild(script);
    }
  }, []);

  const currentPlan = PLANS.find((p) => p.key === selectedPlan)!;
  const price = currentPlan.price;

  const handleSubscribe = async () => {
    if (!session?.access_token) return;
    
    // Find matching plan from DB
    const dbPlan = dbPlans.find((p) => p.name.toLowerCase() === currentPlan.name.toLowerCase());
    if (!dbPlan) {
      alert("Paket tidak ditemukan di database. Pastikan backend sudah di-seed.");
      return;
    }

    try {
      setLoading(true);
      const res = await createSubscriptionTransaction(session.access_token, dbPlan.id);
      
      if (res?.snapToken) {
        // @ts-ignore
        window.snap.pay(res.snapToken, {
          onSuccess: function (result: any) {
            console.log("Success", result);
            navigate("/dashboard");
          },
          onPending: function (result: any) {
            console.log("Pending", result);
            navigate("/dashboard");
          },
          onError: function (result: any) {
            console.error("Error", result);
            alert("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: function () {
            console.log("Popup closed");
          }
        });
      } else {
        alert("Gagal membuat transaksi");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light via-white to-slate-100">
      <Container className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 mb-6 text-sm transition-colors text-slate-500 hover:text-brand-primary"
          >
            <span className="text-base">←</span>
            <span>Kembali ke profil</span>
          </button>

          <div className="mb-10 text-center">
            <h1 className="mb-3 font-serif text-3xl font-bold md:text-4xl text-brand-dark">
              Satu layanan, belajar sepuasnya
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-600">
              Pilih paket <span className="font-semibold">Premium</span> atau{" "}
              <span className="font-semibold">Ultimate</span> dan nikmati semua fitur
              SabiAcademia tanpa batas.
            </p>
          </div>

          <div className="relative p-6 overflow-hidden shadow-2xl bg-gradient-to-br from-brand-primary via-brand-secondary to-slate-900 rounded-3xl md:p-10">
            <div className="absolute w-64 h-64 rounded-full -right-24 -bottom-24 bg-brand-secondary/40 blur-3xl" />
            <div className="absolute w-64 h-64 rounded-full -left-24 -top-24 bg-brand-primary/40 blur-3xl" />

            <div className="relative z-10 grid gap-8 md:grid-cols-[1.4fr,1fr] items-start">
              <div>
                <div className="inline-flex p-1 mb-4 text-xs rounded-full bg-black/20 md:text-sm text-slate-100">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => setSelectedPlan(plan.key)}
                      className={[
                        "relative px-4 py-2 rounded-full transition-all",
                        selectedPlan === plan.key
                          ? "bg-white text-brand-dark shadow-md"
                          : "text-slate-100/80 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {plan.name}
                      {plan.highlight && (
                        <span className="ml-2 text-[10px] font-semibold text-brand-secondary">
                          Rekomendasi
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mb-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Rp{price.toLocaleString("id-ID")}{" "}
                </div>
                <div className="mb-4 text-sm text-white md:text-base">
                  {currentPlan.description}
                </div>

              </div>

              <div className="w-full p-4 space-y-4 shadow-xl bg-white/80 backdrop-blur rounded-2xl md:p-5">
                <div className="text-xs text-slate-600">
                  <div className="flex items-center justify-between mb-1.5">
                    <span>Plan</span>
                    <span className="font-semibold text-brand-dark">{currentPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span>Jenis akses</span>
                    <span className="font-semibold">Lifetime (seumur hidup)</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 text-sm font-semibold border-t border-slate-200">
                    <span>Total dibayar</span>
                    <span className="text-brand-primary">
                      Rp{price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-1 transition-all duration-300 transform bg-gradient-to-r from-brand-primary to-brand-secondary hover:scale-105"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Pilih"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

