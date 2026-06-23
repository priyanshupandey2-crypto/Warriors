"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("auralearn_token");
    const savedUser = localStorage.getItem("auralearn_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("auralearn_token", data.token);
      localStorage.setItem("auralearn_user", JSON.stringify(data.user));
    } catch {
      // For demo: mock login
      const mockUser: User = {
        id: 1,
        name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role: email.includes("admin") ? "admin" : "user",
      };
      const mockToken = "mock_jwt_" + Date.now();
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("auralearn_token", mockToken);
      localStorage.setItem("auralearn_user", JSON.stringify(mockUser));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error("Signup failed");
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("auralearn_token", data.token);
      localStorage.setItem("auralearn_user", JSON.stringify(data.user));
    } catch {
      const mockUser: User = { id: 1, name, email, role: "user" };
      const mockToken = "mock_jwt_" + Date.now();
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("auralearn_token", mockToken);
      localStorage.setItem("auralearn_user", JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auralearn_token");
    localStorage.removeItem("auralearn_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
