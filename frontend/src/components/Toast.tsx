"use client";
import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-tertiary",
    error: "bg-error",
    info: "bg-primary",
    warning: "bg-warning",
  }[type];

  const textColor = {
    success: "text-on-tertiary",
    error: "text-on-error",
    info: "text-on-primary",
    warning: "text-on-warning",
  }[type];

  const icon = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${bgColor} ${textColor} px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4`}>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
