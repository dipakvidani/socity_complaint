import { apiSlice } from "./apiSlice";
import type { ApiResponse, User } from "../types";
import type { LoginValues, ProfileValues } from "../utils/validation";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<User>, LoginValues>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation<ApiResponse<User>, FormData>({
      query: (formData) => ({
        url: "/auth/register",
        method: "POST",
        body: formData,
      }),
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "Complaint"],
    }),
    updateProfile: builder.mutation<ApiResponse<User>, ProfileValues>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateAvatar: builder.mutation<ApiResponse<User>, FormData>({
      query: (formData) => ({
        url: "/auth/avatar",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    deleteAvatar: builder.mutation<ApiResponse<User>, void>({
      query: () => ({
        url: "/auth/avatar",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useDeleteAvatarMutation,
  useGetMeQuery,
} = authApi;
