import EmptyState from "@/components/dashboard/EmptyState";
import LoadingState from "@/components/dashboard/LoadingState";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import React, { useMemo, useState } from "react";

export interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Header label */
  label: string;
  /** Extract the sortable primitive from a row */
  accessor?: (row: T) => string | number | undefined | null;
  /** Custom render function */
  render?: (row: T) => React.ReactNode;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Tailwind width classes e.g. "w-16" */
  width?: string;
  /** Alignment */
  align?: "left" | "center" | "right";
  /** Hide below certain breakpoints */
  hideBelow?: "sm" | "md" | "lg";
}

type SortDir = "asc" | "desc";

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  /** Actions column rendered as last cell */
  rowActions?: (row: T) => React.ReactNode;
  /** Override the default actions button */
  actionsIcon?: React.ReactNode;
  className?: string;
};

const HIDE_CLASS: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your filters or search.",
  onRowClick,
  rowActions,
  className = "",
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.accessor) return data;
    return [...data].sort((a, b) => {
      const av = col.accessor!(a) ?? "";
      const bv = col.accessor!(b) ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey)
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
    );
  };

  if (loading) return <LoadingState rows={5} />;

  if (!data.length) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} compact />
    );
  }

  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={`overflow-x-auto -mx-5 ${className}`}>
      <table className="min-w-full" role="grid">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 ${alignClass[col.align ?? "left"]} ${col.width ?? ""} ${col.hideBelow ? HIDE_CLASS[col.hideBelow] : ""}`}
              >
                {col.sortable ? (
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                    aria-label={`Sort by ${col.label}`}
                  >
                    {col.label}
                    <SortIcon colKey={col.key} />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
            {rowActions && (
              <th scope="col" className="px-5 py-3 w-14" aria-label="Actions" />
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-slate-100 transition-colors ${onRowClick ? "cursor-pointer hover:bg-indigo-50/40" : "hover:bg-slate-50/60"}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-5 py-3.5 text-sm text-slate-700 ${alignClass[col.align ?? "left"]} ${col.hideBelow ? HIDE_CLASS[col.hideBelow] : ""}`}
                >
                  {col.render
                    ? col.render(row)
                    : String(col.accessor?.(row) ?? "—")}
                </td>
              ))}
              {rowActions && (
                <td className="px-5 py-3.5">
                  <div className="flex justify-end">{rowActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

// ─── Convenience row-action button ─────────────────────────────────────────

export const RowActionButton: React.FC<{
  label: string;
  onClick: (e: React.MouseEvent) => void;
}> = ({ label, onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    aria-label={label}
    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
  >
    <MoreHorizontal className="h-4 w-4" />
  </button>
);
