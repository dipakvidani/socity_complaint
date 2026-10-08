import api from "../../../config/api";
import type { ApiResponse, User } from "../../../types";
import type { LoginValues, ProfileValues } from "../../../utils/validation";

export const authService = {
  login: (body: LoginValues) => api.post<ApiResponse<User>>("/auth/login", body).then((r) => r.data),
  register: (formData: FormData) => api.post<ApiResponse<User>>("/auth/register", formData).then((r) => r.data),
  logout: () => api.post<ApiResponse<null>>("/auth/logout").then((r) => r.data),
  updateProfile: (body: ProfileValues) => api.patch<ApiResponse<User>>("/auth/profile", body).then((r) => r.data),
  updateAvatar: (formData: FormData) => api.patch<ApiResponse<User>>("/auth/avatar", formData).then((r) => r.data),
  deleteAvatar: () => api.delete<ApiResponse<User>>("/auth/avatar").then((r) => r.data),
  me: () => api.get<ApiResponse<User>>("/auth/me").then((r) => r.data),
};
