"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { setToastCallback } from "@/utils/apiClient";

export default function TokenExpirationHandler() {
  const { isLogin, isTokenValid, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // Register toast callback so apiClient can show toasts
  useEffect(() => {
    setToastCallback((message, type) => {
      showToast(message, type as "error" | "success" | "warning" | "info");
    });
  }, [showToast]);

  useEffect(() => {
    // If token is invalid, logout and redirect to login
    if (isLogin && !isTokenValid) {
      logout();
      router.push("/login");
    }
  }, [isLogin, isTokenValid, logout, router]);

  return null;
}
