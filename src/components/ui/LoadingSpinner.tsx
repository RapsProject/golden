export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 border-4 rounded-full border-slate-200"
          />
          <div
            className="absolute inset-0 border-4 border-transparent rounded-full border-t-brand-gold animate-spin"
          />
        </div>
        <p className="text-sm font-medium tracking-wide text-slate-500">
          Loading Pages...
        </p>
      </div>
    </div>
  );
}
