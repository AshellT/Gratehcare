import React from "react";

// ─── Single skeleton line ─────────────────────────────────────────────────────
export const SkeletonLine: React.FC<{ className?: string }> = ({
  className = "",
}) => <div className={`skeleton h-4 rounded ${className}`} />;

// ─── Skeleton card (stat card shape) ────────────────────────────────────────
export const SkeletonStatCard: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
    <div className="flex items-start justify-between">
      <div className="skeleton h-10 w-10 rounded-xl" />
    </div>
    <SkeletonLine className="w-1/2" />
    <SkeletonLine className="w-3/4 h-6" />
  </div>
);

// ─── Skeleton table row ──────────────────────────────────────────────────────
export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div
          className={`skeleton h-4 rounded ${i === 0 ? "w-3/4" : "w-1/2"}`}
        />
      </td>
    ))}
  </tr>
);

// ─── Page loading (full content skeleton) ────────────────────────────────────
const LoadingState: React.FC<{
  rows?: number;
  showStats?: boolean;
}> = ({ rows = 5, showStats = true }) => (
  <div className="space-y-6 animate-fade-in-up">
    {/* Header skeleton */}
    <div className="pb-6 border-b border-slate-200 space-y-2">
      <SkeletonLine className="w-24 h-3" />
      <SkeletonLine className="w-48 h-7" />
      <SkeletonLine className="w-72 h-4" />
    </div>

    {/* Stat cards skeleton */}
    {showStats && (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    )}

    {/* Table skeleton */}
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <SkeletonLine className="w-32 h-5" />
        <SkeletonLine className="w-20 h-8 rounded-full" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {[40, 60, 50, 40, 30].map((w, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div
                  className={`skeleton h-3 rounded`}
                  style={{ width: `${w}%` }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LoadingState;
