import { useState } from "react";

interface ToastBannerProps {
  toasts: Array<{ id: number; message: string; type: "success" | "error" | "info" }>;
}

export function ToastBanner({ toasts }: ToastBannerProps) {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto w-max max-w-sm ${
            toast.type === "success" ? "bg-emerald/90 text-emerald-foreground" :
            toast.type === "error" ? "bg-destructive/90 text-destructive-foreground" :
            "glass"
          } rounded-xl px-4 py-3 shadow-2xl border border-primary/20`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {toast.type === "success" && "✅"}
              {toast.type === "error" && "❌"}
              {toast.type === "info" && "ℹ️"}
            </span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: "success" | "error" | "info" }>>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return { toasts, showToast };
}