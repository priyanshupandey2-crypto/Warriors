const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface FetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  detail?: string;
}

let toastCallback: ((message: string, type: string) => void) | null = null;

// Register toast callback from ToastContext
export function setToastCallback(callback: (message: string, type: string) => void) {
  toastCallback = callback;
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
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.detail || error.message || `HTTP ${response.status}`;
    const apiError = new Error(message) as ApiError;
    apiError.status = response.status;
    apiError.detail = error.detail;

    // Handle 401 - Token expired or invalid
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auralearn_token");

        // Only show toast if user was actually logged in
        if (token) {
          // Show toast notification
          if (toastCallback) {
            toastCallback("Your session expired. Please login again.", "error");
          }

          // Clear auth data
          localStorage.removeItem("auralearn_token");
          localStorage.removeItem("auralearn_user");

          // Redirect to login after a short delay to allow toast to be seen
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }
      }
    }

    throw apiError;
  }

  return response.json();
}

export default apiCall;
