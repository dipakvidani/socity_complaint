import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { SelectField } from "../../../components/Field/Field";
import type { Category, ListParams, Status } from "../../../types";
import { CATEGORIES, STATUSES } from "../../../utils/constants";
import { filters, LIMITS } from "../../../utils/validation";

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "priority:desc", label: "Highest priority" },
  { value: "priority:asc", label: "Lowest priority" },
  { value: "title:asc", label: "Title A to Z" },
  { value: "status:asc", label: "Status" },
];

interface ComplaintFiltersProps {
  params: ListParams;
  onChange: (next: Partial<ListParams>) => void;
}

export default function ComplaintFilters({ params, onChange }: ComplaintFiltersProps) {
  const [text, setText] = useState(params.search ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      const next = text.trim();
      if (next !== (params.search ?? "")) onChange({ search: next || undefined, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid gap-grid sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" fontSize="small" />
        <input
          value={text}
          maxLength={LIMITS.search}
          onChange={(e) => setText(filters.text(e.target.value))}
          placeholder="Search by title, details or name"
          aria-label="Search complaints"
          className="h-12 w-full rounded-full bg-card pr-4 pl-11 text-body text-ink outline-none placeholder:text-ash focus:border focus:border-ash focus:bg-canvas focus:ring-4 focus:ring-focus"
        />
      </div>
      <SelectField
        aria-label="Filter by status"
        placeholder="All statuses"
        options={STATUSES}
        value={params.status ?? ""}
        onChange={(e) => onChange({ status: (e.target.value as Status) || undefined, page: 1 })}
      />
      <SelectField
        aria-label="Filter by category"
        placeholder="All categories"
        options={CATEGORIES}
        value={params.category ?? ""}
        onChange={(e) => onChange({ category: (e.target.value as Category) || undefined, page: 1 })}
      />
      <SelectField
        aria-label="Sort complaints"
        options={SORTS}
        value={`${params.sort}:${params.order}`}
        onChange={(e) => {
          const [sort, order] = e.target.value.split(":") as [ListParams["sort"], ListParams["order"]];
          onChange({ sort, order, page: 1 });
        }}
      />
    </div>
  );
}
