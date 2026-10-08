import api from "../../../config/api";
import type { ApiResponse, Comment, Complaint, ComplaintDetail, ListParams, Meta, Status } from "../../../types";
export {
  complaintApi,
  useGetComplaintsQuery,
  useGetComplaintDetailQuery,
  useCreateComplaintMutation,
  useAddCommentMutation,
  useCancelComplaintMutation,
  useChangeStatusMutation,
} from "../../../store/complaintApi";

export const complaintService = {
  list: (params: ListParams) => api.get<ApiResponse<Complaint[], Meta>>("/complaints", { params }).then((r) => r.data),
  detail: (id: string) => api.get<ApiResponse<ComplaintDetail>>(`/complaints/${id}`).then((r) => r.data),
  create: (formData: FormData) => api.post<ApiResponse<Complaint>>("/complaints", formData).then((r) => r.data),
  update: (id: number, formData: FormData) => api.put<ApiResponse<Complaint>>(`/complaints/${id}`, formData).then((r) => r.data),
  addComment: (id: number, message: string) => api.post<ApiResponse<Comment>>(`/complaints/${id}/comments`, { message }).then((r) => r.data),
  cancel: (id: number) => api.patch<ApiResponse<Complaint>>(`/complaints/${id}/cancel`).then((r) => r.data),
  changeStatus: (id: number, status: Exclude<Status, "cancelled">) =>
    api.patch<ApiResponse<Complaint>>(`/complaints/${id}/status`, { status }).then((r) => r.data),
};
