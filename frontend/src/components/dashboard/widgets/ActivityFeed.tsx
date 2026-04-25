import React from "react";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

export type ActivityItem = {
  id: string;
  who: string;
  what: string;
  when: string;
  tag?: { label: string; tone: "emerald" | "amber" | "rose" | "indigo" | "sky" | "slate" | "violet" };
};

const ActivityFeed: React.FC<{
  title?: string;
  description?: string;
  items: ActivityItem[];
  className?: string;
}> = ({ title = "Recent activity", description, items, className }) => {
  return (
    <Card title={title} description={description} className={className}>
      <ol className="relative border-l-2 border-slate-100 ml-2 pl-5 space-y-4">
        {items.map((it) => (
          <li key={it.id} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-white border-2 border-indigo-500" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="text-sm">
                <span className="font-semibold text-slate-900">{it.who}</span>
                <span className="text-slate-600"> {it.what}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                {it.tag && <Badge tone={it.tag.tone}>{it.tag.label}</Badge>}
                <span>{it.when}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
};

export default ActivityFeed;
