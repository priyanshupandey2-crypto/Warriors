"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function TokenExpirationHandler() {
  const { isLogin, isTokenValid, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If token is invalid, logout and redirect to login
    if (isLogin && !isTokenValid) {
      logout();
      router.push("/login");
    }
  }, [isLogin, isTokenValid, logout, router]);

  return null;
}
