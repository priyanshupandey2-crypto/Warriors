import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface TokenStatus {
  isValid: boolean;
  isExpiringSoon: boolean;
  expiryTime: string | null;
  timeUntilExpiry: string | null;
  tokenPayload: any | null;
}

export function useTokenStatus(): TokenStatus {
  const { isTokenValid, tokenExpiry, isTokenExpiringSoon, getTokenPayload, getTokenExpiryTime } = useAuth();
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenExpiry) {
      setTimeUntilExpiry(null);
      return;
    }

    const updateTimeUntilExpiry = () => {
      const now = Date.now();
      const timeLeft = tokenExpiry - now;

      if (timeLeft <= 0) {
        setTimeUntilExpiry("Expired");
      } else if (timeLeft < 60 * 1000) {
        const seconds = Math.floor(timeLeft / 1000);
        setTimeUntilExpiry(`${seconds}s`);
      } else if (timeLeft < 60 * 60 * 1000) {
        const minutes = Math.floor(timeLeft / (60 * 1000));
        setTimeUntilExpiry(`${minutes}m`);
      } else {
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        setTimeUntilExpiry(`${hours}h ${minutes}m`);
      }
    };

    updateTimeUntilExpiry();
    const interval = setInterval(updateTimeUntilExpiry, 1000);

    return () => clearInterval(interval);
  }, [tokenExpiry]);

  return {
    isValid: isTokenValid,
    isExpiringSoon: isTokenExpiringSoon(),
    expiryTime: getTokenExpiryTime(),
    timeUntilExpiry,
    tokenPayload: getTokenPayload(),
  };
}
