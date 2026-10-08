import { useState } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import toast from "../../../utils/toast";
import { getErrorMessage } from "../../../config/api";
import type { Complaint, ListParams, Status } from "../../../types";
import { STATUSES } from "../../../utils/constants";
import ComplaintFilters from "../components/ComplaintFilters";
import ComplaintList from "../components/ComplaintList";
import { useComplaints } from "../hooks/useComplaints";
import { useComplaintSockets } from "../hooks/useComplaintSockets";
import { complaintService } from "../services/complaintService";

export default function AdminDashboardPage() {
  const [params, setParams] = useState<ListParams>({ page: 1, limit: 9, sort: "createdAt", order: "desc" });
  const data = useComplaints(params);
  const patch = (next: Partial<ListParams>) => setParams((p) => ({ ...p, ...next }));

  useComplaintSockets(() => data.reload(true));

  const changeStatus = async (complaint: Complaint, status: Exclude<Status, "cancelled">) => {
    try {
      const res = await complaintService.changeStatus(complaint.id, status);
      toast.success(res.message);
      data.reload(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not update the status. Please try again."));
    }
  };

  return (
    <div className="flex flex-col gap-section">
      <div>
        <h1 className="text-page font-extrabold tracking-tight text-ink">All complaints</h1>
        <p className="text-small text-mute">Review what residents have raised and keep them updated.</p>
      </div>
      <ComplaintFilters params={params} onChange={patch} />
      <ComplaintList
        admin
        data={data}
        params={params}
        onPage={(page) => patch({ page })}
        renderActions={(c) =>
          c.status === "cancelled" ? null : (
            <Select
              size="small"
              aria-label={`Change status of ${c.title}`}
              value={c.status}
              onChange={(e) => changeStatus(c, e.target.value as Exclude<Status, "cancelled">)}
              sx={{
                height: 36,
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: "var(--color-canvas)",
                color: "var(--color-ink)",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-hairline)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-ink)" },
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      borderRadius: "12px",
                      backgroundColor: "var(--color-canvas)",
                      color: "var(--color-ink)",
                      "& .MuiMenuItem-root": { fontSize: "13px", padding: "8px 14px" },
                    },
                  },
                },
              }}
            >
              {STATUSES.filter((s) => s.value !== "cancelled").map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          )
        }
      />
    </div>
  );
}
