import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import AddIcon from "@mui/icons-material/Add";
import Button from "../../../components/Button/Button";
import type { ListParams } from "../../../types";
import ComplaintFilters from "../components/ComplaintFilters";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintList from "../components/ComplaintList";
import { useComplaints } from "../hooks/useComplaints";
import { useComplaintSockets } from "../hooks/useComplaintSockets";

export default function ResidentPage() {
  const [params, setParams] = useState<ListParams>({ page: 1, limit: 9, sort: "createdAt", order: "desc" });
  const [open, setOpen] = useState(false);
  const data = useComplaints(params);
  const patch = (next: Partial<ListParams>) => setParams((p) => ({ ...p, ...next }));

  useComplaintSockets(() => data.reload(true));

  const newButton = (
    <Button onClick={() => setOpen(true)}>
      <AddIcon fontSize="small" /> New complaint
    </Button>
  );

  return (
    <div className="flex flex-col gap-section">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page font-semibold tracking-tight text-ink">My complaints</h1>
          <p className="text-small text-mute">Track what you have raised with the society office.</p>
        </div>
        {newButton}
      </div>
      <ComplaintFilters params={params} onChange={patch} />
      <ComplaintList data={data} params={params} onPage={(page) => patch({ page })} emptyAction={newButton} />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
        <div className="flex flex-col gap-4 bg-canvas p-6">
          <h2 className="text-heading font-semibold text-ink">Raise a complaint</h2>
          <ComplaintForm
            onCancel={() => setOpen(false)}
            onDone={() => {
              setOpen(false);
              setParams((p) => ({ ...p, page: 1, sort: "createdAt", order: "desc" }));
              data.reload();
            }}
          />
        </div>
      </Dialog>
    </div>
  );
}
