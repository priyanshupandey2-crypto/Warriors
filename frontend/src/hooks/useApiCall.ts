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
          logout();
        }

        throw error;
      }
    },
    [logout]
  );

  return call;
}
