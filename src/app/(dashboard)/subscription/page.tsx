import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { Button } from "../../../components/ui/Button";

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
    price: 349000,
  },
  {
    key: "Ultimate",
    name: "Ultimate",
    description: "Semua fitur Premium ditambah akses lebih banyak soal.",
    price: 599000,
    highlight: true,
  },
];

export function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("Premium");
  const navigate = useNavigate();

  const currentPlan = PLANS.find((p) => p.key === selectedPlan)!;
  const price = currentPlan.price;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light via-white to-slate-100">
      <Container className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-primary transition-colors"
          >
            <span className="text-base">←</span>
            <span>Kembali ke profil</span>
          </button>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-3">
              Satu layanan, belajar sepuasnya
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
              Pilih paket <span className="font-semibold">Premium</span> atau{" "}
              <span className="font-semibold">Ultimate</span> dan nikmati semua fitur
              SabiAcademia tanpa batas.
            </p>
          </div>

          <div className="bg-gradient-to-br from-brand-primary via-brand-secondary to-slate-900 rounded-3xl shadow-2xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-brand-secondary/40 rounded-full blur-3xl" />
            <div className="absolute -left-24 -top-24 w-64 h-64 bg-brand-primary/40 rounded-full blur-3xl" />

            <div className="relative z-10 grid gap-8 md:grid-cols-[1.4fr,1fr] items-start">
              <div>
                <div className="mb-4 inline-flex rounded-full bg-black/20 p-1 text-xs md:text-sm text-slate-100">
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

                <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                  Rp{price.toLocaleString("id-ID")}{" "}
                </div>
                <div className="text-sm md:text-base text-white mb-4">
                  {currentPlan.description}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 text-slate-50 text-xs md:text-sm font-medium">
                  <span className="font-semibold text-white">
                    Sekali bayar, akses seumur hidup
                  </span>
                </div>
              </div>

              <div className="w-full space-y-4 bg-white/80 backdrop-blur rounded-2xl p-4 md:p-5 shadow-xl">
                <div className="text-xs text-slate-600">
                  <div className="flex items-center justify-between mb-1.5">
                    <span>Plan</span>
                    <span className="font-semibold text-brand-dark">{currentPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span>Jenis akses</span>
                    <span className="font-semibold">Lifetime (seumur hidup)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold mt-2 border-t border-slate-200 pt-2">
                    <span>Total dibayar</span>
                    <span className="text-brand-primary">
                      Rp{price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-1  
                  bg-gradient-to-r from-brand-primary to-brand-secondary transform hover:scale-105 transition-all duration-300"
                  // TODO: Integrasikan dengan Midtrans ketika backend siap
                  onClick={() => {
                    // Placeholder: nanti akan memulai proses pembayaran Midtrans
                  }}
                >
                  Pilih
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

