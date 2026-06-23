const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface FetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

export async function apiCall<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auralearn_token");
    if (token) {
      headers["Authorization"] = token;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.detail || error.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export default apiCall;
