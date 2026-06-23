"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("auralearn_token");
    const savedUser = localStorage.getItem("auralearn_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("auralearn_token");
        localStorage.removeItem("auralearn_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.detail || errorData.message || "Login failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("auralearn_token", data.access_token);
      localStorage.setItem("auralearn_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.detail || errorData.message || "Signup failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("auralearn_token", data.access_token);
      localStorage.setItem("auralearn_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("auralearn_token");
    localStorage.removeItem("auralearn_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
