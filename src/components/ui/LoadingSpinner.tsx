import { useEffect, useState } from "react";

export function LoadingSpinner() {
  const [show, setShow] = useState(false);

  // Prevent flash of loading state on fast navigations
  // Only show the spinner if loading takes more than 150ms
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light animate-[fade-in_0.3s_ease]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 rounded-full border-slate-200" />
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-brand-gold animate-spin" />
        </div>
        <p className="text-sm font-medium tracking-wide text-slate-500">
          Memuat…
        </p>
      </div>
    </div>
  );
}
