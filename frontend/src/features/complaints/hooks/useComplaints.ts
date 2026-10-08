import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../../../config/api";
import type { Complaint, ListParams, Meta } from "../../../types";
import { complaintService } from "../services/complaintService";

export interface ComplaintsState {
  items: Complaint[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
}

export type ComplaintsResult = ComplaintsState & { reload: (silent?: boolean) => Promise<void> };

export function useComplaints(params: ListParams): ComplaintsResult {
  const [state, setState] = useState<ComplaintsState>({ items: [], meta: null, loading: true, error: null });
  const key = JSON.stringify(params);
  const latest = useRef(0);

  const load = useCallback(
    async (silent = false) => {
      const id = ++latest.current;
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await complaintService.list(JSON.parse(key) as ListParams);
        if (id === latest.current) setState({ items: res.data, meta: res.meta, loading: false, error: null });
      } catch (error) {
        if (id === latest.current) setState((s) => ({ ...s, loading: false, error: getErrorMessage(error, "We could not load the complaints.") }));
      }
    },
    [key]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
