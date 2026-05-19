import { Clock, Eye } from "lucide-react";
import React from "react";

type Props = {
  /** Short display label (e.g. "NDIS Support Coordination") */
  label: string;
  /** Visible to screen readers, audit logs and exports (e.g. "support_coordination") */
  auditKey?: string;
  /** Show a small eye indicator that this field is audit-logged */
  logged?: boolean;
  /** Extra classes */
  className?: string;
};

/**
 * AuditLabel — renders a UI label that carries a stable audit key.
 *
 * The `data-audit-key` attribute is picked up by the audit logger to record
 * which NDIS/SCHADS/CQC field the user interacted with, independent of
 * any future display-name changes.
 */
const AuditLabel: React.FC<Props> = ({
  label,
  auditKey,
  logged = false,
  className = "",
}) => (
  <span
    className={`inline-flex items-center gap-1.5 ${className}`}
    data-audit-key={auditKey}
    title={auditKey ? `Audit key: ${auditKey}` : undefined}
  >
    {label}
    {logged && (
      <Eye
        className="h-3 w-3 text-slate-400"
        aria-label="This field is audit-logged"
      />
    )}
  </span>
);

export default AuditLabel;

// ─── Audit-safe timestamp chip ──────────────────────────────────────────────

export const AuditTimestamp: React.FC<{
  iso: string;
  label?: string;
  className?: string;
}> = ({ iso, label, className = "" }) => {
  const date = new Date(iso);
  const display = date.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-slate-500 ${className}`}
      title={iso}
      aria-label={label ? `${label}: ${display}` : display}
    >
      <Clock className="h-3 w-3" />
      {display}
    </span>
  );
};
