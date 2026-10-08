import { ReactNode } from "react";
import Pagination from "@mui/material/Pagination";
import { EmptyState, ErrorState, Loader } from "../../../components/States/States";
import type { Complaint, ListParams } from "../../../types";
import type { ComplaintsResult } from "../hooks/useComplaints";
import ComplaintCard from "./ComplaintCard";

interface ComplaintListProps {
  data: ComplaintsResult;
  params: ListParams;
  onPage: (page: number) => void;
  admin?: boolean;
  emptyAction?: ReactNode;
  renderActions?: (complaint: Complaint) => ReactNode;
}

export default function ComplaintList({ data, params, onPage, admin = false, emptyAction, renderActions }: ComplaintListProps) {
  const { items, meta, loading, error, reload } = data;

  if (loading && !items.length) return <Loader label="Loading complaints..." />;
  if (error) return <ErrorState message={error} onRetry={() => reload()} />;
  if (!items.length) {
    const filtered = params.search || params.status || params.category;
    return (
      <EmptyState
        title={filtered ? "No complaints match" : "No complaints yet"}
        message={filtered ? "Try a different search or clear the filters." : admin ? "New complaints from residents will show up here." : "When something needs the society's attention, raise it here."}
        action={filtered ? null : emptyAction}
      />
    );
  }

  return (
    <div className="flex flex-col gap-section">
      <div className={`grid gap-grid sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
        {items.map((c) => (
          <ComplaintCard key={c.id} complaint={c} admin={admin} actions={renderActions?.(c)} />
        ))}
      </div>
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination count={meta.totalPages} page={meta.page} onChange={(_, page) => onPage(page)} shape="rounded" />
        </div>
      )}
    </div>
  );
}
