// JWT Token utility functions

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function decodeJWT(token: string): TokenPayload | null {
  try {
    const cleanToken = token.replace("Bearer ", "");
    const parts = cleanToken.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJWT(token);
  if (!payload) return false;
  const expiryTime = payload.exp * 1000;
  return Date.now() < expiryTime;
}

export function getTokenExpiry(token: string | null): number | null {
  if (!token) return null;
  const payload = decodeJWT(token);
  return payload ? payload.exp * 1000 : null;
}

export function getTokenExpiryDate(token: string | null): Date | null {
  const expiry = getTokenExpiry(token);
  return expiry ? new Date(expiry) : null;
}

export function getTimeUntilExpiry(token: string | null): number | null {
  const expiry = getTokenExpiry(token);
  if (!expiry) return null;
  return Math.max(0, expiry - Date.now());
}

export function getTimeUntilExpiryFormatted(token: string | null): string | null {
  const timeLeft = getTimeUntilExpiry(token);
  if (timeLeft === null) return null;

  if (timeLeft <= 0) return "Expired";

  const seconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function isTokenExpiringSoon(token: string | null, minutesBefore: number = 5): boolean {
  const timeLeft = getTimeUntilExpiry(token);
  if (timeLeft === null) return false;
  return timeLeft <= minutesBefore * 60 * 1000;
}

export function getTokenUserInfo(token: string | null) {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    issuedAt: new Date(payload.iat * 1000),
    expiresAt: new Date(payload.exp * 1000),
  };
}

export function getTokenMetadata(token: string | null) {
  const payload = decodeJWT(token);
  if (!payload) return null;

  const issuedAt = payload.iat * 1000;
  const expiresAt = payload.exp * 1000;
  const now = Date.now();
  const totalDuration = expiresAt - issuedAt;
  const elapsedTime = now - issuedAt;
  const remainingTime = expiresAt - now;
  const percentageUsed = (elapsedTime / totalDuration) * 100;

  return {
    isValid: now < expiresAt,
    isExpired: now >= expiresAt,
    isExpiringSoon: remainingTime <= 5 * 60 * 1000,
    issuedAt: new Date(issuedAt),
    expiresAt: new Date(expiresAt),
    remainingTime,
    elapsedTime,
    totalDuration,
    percentageUsed: Math.min(100, Math.max(0, percentageUsed)),
  };
}

export function extractTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auralearn_token");
}

export function saveTokenToStorage(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auralearn_token", token);
}

export function removeTokenFromStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auralearn_token");
}

export function validateTokenStructure(token: string): boolean {
  const parts = token.replace("Bearer ", "").split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}
