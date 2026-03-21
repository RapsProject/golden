export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-4 border-slate-200"
          />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-gold animate-spin"
          />
        </div>
        <p className="text-slate-500 text-sm font-medium tracking-wide">
          Memuat halaman…
        </p>
      </div>
    </div>
  );
}
