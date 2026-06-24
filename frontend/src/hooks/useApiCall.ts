import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiCall, FetchOptions, ApiError } from "@/utils/apiClient";

export function useApiCall() {
  const { logout } = useAuth();

  const call = useCallback(
    async <T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
      try {
        return await apiCall<T>(endpoint, options);
      } catch (error) {
        const apiError = error as ApiError;

        // Handle 401 - Token expired/invalid
        if (apiError.status === 401) {
          // Check if token still exists in localStorage
          const token = typeof window !== "undefined" ? localStorage.getItem("auralearn_token") : null;

          // Only logout and show error if user was actually logged in
          if (token) {
            logout();
          }
          // If no token, user already logged out - silently ignore this error
          else {
            return undefined as T;
          }
        }

        throw error;
      }
    },
    [logout]
  );

  return call;
}
