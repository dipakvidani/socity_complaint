import { apiSlice } from "./apiSlice";
import type { ApiResponse, Comment, Complaint, ComplaintDetail, ListParams, Meta, Status } from "../types";

export const complaintApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getComplaints: builder.query<ApiResponse<Complaint[], Meta>, ListParams>({
      query: (params) => ({
        url: "/complaints",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Complaint" as const, id })),
              { type: "Complaint", id: "LIST" },
            ]
          : [{ type: "Complaint", id: "LIST" }],
    }),
    getComplaintDetail: builder.query<ApiResponse<ComplaintDetail>, string>({
      query: (id) => `/complaints/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Complaint", id }],
    }),
    createComplaint: builder.mutation<ApiResponse<Complaint>, FormData>({
      query: (formData) => ({
        url: "/complaints",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Complaint", id: "LIST" }],
    }),
    updateComplaint: builder.mutation<ApiResponse<Complaint>, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/complaints/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Complaint", id },
        { type: "Complaint", id: "LIST" },
      ],
    }),
    addComment: builder.mutation<ApiResponse<Comment>, { id: number; message: string }>({
      query: ({ id, message }) => ({
        url: `/complaints/${id}/comments`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Complaint", id },
        { type: "Comment", id: `LIST_${id}` },
      ],
    }),
    cancelComplaint: builder.mutation<ApiResponse<Complaint>, number>({
      query: (id) => ({
        url: `/complaints/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Complaint", id },
        { type: "Complaint", id: "LIST" },
      ],
    }),
    changeStatus: builder.mutation<ApiResponse<Complaint>, { id: number; status: Exclude<Status, "cancelled"> }>({
      query: ({ id, status }) => ({
        url: `/complaints/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Complaint", id },
        { type: "Complaint", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetComplaintsQuery,
  useGetComplaintDetailQuery,
  useCreateComplaintMutation,
  useUpdateComplaintMutation,
  useAddCommentMutation,
  useCancelComplaintMutation,
  useChangeStatusMutation,
} = complaintApi;
