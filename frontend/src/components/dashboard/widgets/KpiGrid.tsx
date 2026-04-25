import React from "react";
import StatCard from "@/components/dashboard/StatCard";

export type Kpi = {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: React.ReactNode;
  tone?: "indigo" | "emerald" | "sky" | "amber" | "rose" | "slate";
};

const KpiGrid: React.FC<{ items: Kpi[] }> = ({ items }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {items.map((k, i) => (
      <StatCard
        key={k.label}
        index={i}
        label={k.label}
        value={k.value}
        hint={k.hint}
        delta={k.delta}
        icon={k.icon}
        tone={k.tone}
      />
    ))}
  </div>
);

export default KpiGrid;
