import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

interface TokenRefreshOptions {
  checkInterval?: number; // milliseconds, default: 60000 (1 minute)
  refreshBefore?: number; // minutes before expiry, default: 5
}

export function useTokenRefresh(options: TokenRefreshOptions = {}) {
  const { refreshTokenIfNeeded, isLogin } = useAuth();
  const { checkInterval = 60000, refreshBefore = 5 } = options;

  useEffect(() => {
    if (!isLogin) return;

    const interval = setInterval(async () => {
      await refreshTokenIfNeeded();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [isLogin, checkInterval, refreshTokenIfNeeded]);
}
