"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isLogin: boolean;
  isTokenValid: boolean;
  tokenExpiry: number | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
  getTokenPayload: () => TokenPayload | null;
  getTokenExpiryTime: () => string | null;
  isTokenExpiringSoon: (minutesBefore?: number) => boolean;
  refreshTokenIfNeeded: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);

  // Decode JWT token payload
  const decodeToken = (tokenStr: string): TokenPayload | null => {
    try {
      const cleanToken = tokenStr.replace("Bearer ", "");
      const parts = cleanToken.split(".");
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  };

  // Check if token is valid and not expired
  const validateToken = (tokenStr: string | null): boolean => {
    if (!tokenStr) return false;
    const payload = decodeToken(tokenStr);
    if (!payload) return false;
    const expiryTime = payload.exp * 1000;
    return Date.now() < expiryTime;
  };

  // Get expiry timestamp from token
  const getTokenExpiryTimestamp = (tokenStr: string | null): number | null => {
    if (!tokenStr) return null;
    const payload = decodeToken(tokenStr);
    return payload ? payload.exp * 1000 : null;
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("auralearn_token");
    const savedUser = localStorage.getItem("auralearn_user");

    if (savedToken && savedUser) {
      try {
        const isValid = validateToken(savedToken);
        const expiry = getTokenExpiryTimestamp(savedToken);

        if (isValid) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsLogin(true);
          setIsTokenValid(true);
          setTokenExpiry(expiry);
        } else {
          // Token expired, clear storage
          localStorage.removeItem("auralearn_token");
          localStorage.removeItem("auralearn_user");
          setIsLogin(false);
          setIsTokenValid(false);
        }
      } catch (e) {
        localStorage.removeItem("auralearn_token");
        localStorage.removeItem("auralearn_user");
        setIsLogin(false);
        setIsTokenValid(false);
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
      const isValid = validateToken(data.access_token);
      const expiry = getTokenExpiryTimestamp(data.access_token);

      setToken(data.access_token);
      setUser(data.user);
      setIsLogin(true);
      setIsTokenValid(isValid);
      setTokenExpiry(expiry);
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
      const isValid = validateToken(data.access_token);
      const expiry = getTokenExpiryTimestamp(data.access_token);

      setToken(data.access_token);
      setUser(data.user);
      setIsLogin(true);
      setIsTokenValid(isValid);
      setTokenExpiry(expiry);
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
    setIsLogin(false);
    setIsTokenValid(false);
    setTokenExpiry(null);
    localStorage.removeItem("auralearn_token");
    localStorage.removeItem("auralearn_user");
  };

  const clearError = () => {
    setError(null);
  };

  const getTokenPayload = (): TokenPayload | null => {
    return token ? decodeToken(token) : null;
  };

  const getTokenExpiryTime = (): string | null => {
    if (!tokenExpiry) return null;
    return new Date(tokenExpiry).toISOString();
  };

  const isTokenExpiringSoon = (minutesBefore: number = 5): boolean => {
    if (!tokenExpiry) return false;
    const expiryTime = tokenExpiry;
    const warningTime = Date.now() + minutesBefore * 60 * 1000;
    return expiryTime <= warningTime;
  };

  const refreshTokenIfNeeded = async (): Promise<boolean> => {
    if (!token) return false;

    // If token is expiring soon (within 5 minutes), attempt refresh
    if (isTokenExpiringSoon(5)) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // If backend returns a new token, update it
          if (data.access_token) {
            const isValid = validateToken(data.access_token);
            const expiry = getTokenExpiryTimestamp(data.access_token);
            setToken(data.access_token);
            setIsTokenValid(isValid);
            setTokenExpiry(expiry);
            localStorage.setItem("auralearn_token", data.access_token);
            return true;
          }
          return true; // Token still valid
        } else {
          // Token refresh failed, logout
          logout();
          return false;
        }
      } catch {
        return false;
      }
    }

    return isTokenValid;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      error,
      isLogin,
      isTokenValid,
      tokenExpiry,
      login,
      signup,
      logout,
      clearError,
      getTokenPayload,
      getTokenExpiryTime,
      isTokenExpiringSoon,
      refreshTokenIfNeeded,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
