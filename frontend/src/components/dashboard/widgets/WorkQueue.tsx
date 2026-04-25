import React from "react";
import { ArrowRight } from "lucide-react";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

export type WorkQueueItem = {
  id: string;
  primary: string;
  secondary?: string;
  meta?: string;
  badge?: { label: string; tone: "emerald" | "amber" | "rose" | "indigo" | "sky" | "slate" | "violet"; dot?: boolean };
};

const WorkQueue: React.FC<{
  title: string;
  description?: string;
  items: WorkQueueItem[];
  emptyMessage?: string;
  ctaLabel?: string;
  className?: string;
}> = ({ title, description, items, emptyMessage = "Nothing to action.", ctaLabel = "View all", className }) => {
  return (
    <Card
      title={title}
      description={description}
      className={className}
      action={
        items.length > 0 && (
          <button
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            data-testid={`workqueue-view-all-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {ctaLabel}
            <ArrowRight className="h-3 w-3" />
          </button>
        )
      }
    >
      {items.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-6">{emptyMessage}</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((it) => (
            <li
              key={it.id}
              data-testid={`workqueue-item-${it.id}`}
              className="group flex items-center gap-4 py-3 first:pt-0 last:pb-0 cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                    {it.primary}
                  </div>
                  {it.badge && (
                    <Badge tone={it.badge.tone} dot={it.badge.dot}>
                      {it.badge.label}
                    </Badge>
                  )}
                </div>
                {it.secondary && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {it.secondary}
                  </div>
                )}
              </div>
              {it.meta && (
                <div className="text-xs text-slate-500 flex-shrink-0">{it.meta}</div>
              )}
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default WorkQueue;
