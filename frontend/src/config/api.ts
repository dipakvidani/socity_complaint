import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse, FieldErrors } from "../types";

export const API_URL: string = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: `${API_URL}/api`, withCredentials: true });

const skipRefresh = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];
let refreshing: Promise<unknown> | null = null;
let onSessionEnd: () => void = () => {};

export const setSessionEndHandler = (fn: () => void) => {
  onSessionEnd = fn;
};

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };
type ErrorBody = Partial<ApiResponse<null, { errors?: FieldErrors } | null>>;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorBody>) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    if (status !== 401 || !original || original._retried || skipRefresh.some((p) => original.url?.startsWith(p))) {
      return Promise.reject(error);
    }
    original._retried = true;
    try {
      refreshing ??= api.post("/auth/refresh").finally(() => (refreshing = null));
      await refreshing;
      return api(original);
    } catch {
      onSessionEnd();
      return Promise.reject(error);
    }
  }
);

export const getErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  if (!error) return fallback;
  
  // RTK Query FetchBaseQueryError
  if (typeof error === "object" && "data" in error && error.data) {
    const rtkData = (error as { data?: ErrorBody }).data;
    if (rtkData?.message) return rtkData.message;
  }
  
  // Axios Error
  const err = error as AxiosError<ErrorBody>;
  if (err.response) {
    return err.response.data?.message || fallback;
  }
  
  if (err.message === "Network Error") {
    return "We could not reach the server. Check your connection and try again.";
  }
  
  return fallback;
};

export const getFieldErrors = (error: unknown): FieldErrors | null => {
  if (!error) return null;
  
  // RTK Query FetchBaseQueryError
  if (typeof error === "object" && "data" in error && error.data) {
    const rtkData = (error as { data?: ErrorBody }).data;
    if (rtkData?.meta?.errors) return rtkData.meta.errors;
  }
  
  // Axios Error
  return (error as AxiosError<ErrorBody>).response?.data?.meta?.errors || null;
};

export default api;
