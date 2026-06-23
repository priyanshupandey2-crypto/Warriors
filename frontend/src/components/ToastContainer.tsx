"use client";
import { useToast } from "@/context/ToastContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getStyles = (type: string) => {
    const baseStyles = "p-4 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-3";

    switch (type) {
      case "success":
        return `${baseStyles} bg-tertiary text-on-tertiary`;
      case "error":
        return `${baseStyles} bg-error text-on-error`;
      case "warning":
        return `${baseStyles} bg-warning text-on-warning`;
      default:
        return `${baseStyles} bg-primary text-on-primary`;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return "check_circle";
      case "error":
        return "error";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <div key={toast.id} className={getStyles(toast.type)}>
          <span className="material-symbols-outlined text-lg">{getIcon(toast.type)}</span>
          <div className="flex-1">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
