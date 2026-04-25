import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/dashboard/Card";

export type SeriesPoint = number;

export const SparkArea: React.FC<{
  data: SeriesPoint[];
  color?: string;
  height?: number;
  fillId?: string;
}> = ({ data, color = "#4f46e5", height = 60, fillId = "sparkFill" }) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 90 - 5;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" L ");

  const id = `${fillId}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2 }}
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path d={`M 0,100 L ${points} L 100,100 Z`} fill={`url(#${id})`} />
    </svg>
  );
};

export const TrendCard: React.FC<{
  title: string;
  description?: string;
  data: SeriesPoint[];
  color?: string;
  className?: string;
}> = ({ title, description, data, color, className }) => {
  return (
    <Card title={title} description={description} className={className}>
      <SparkArea data={data} color={color} height={140} />
    </Card>
  );
};

export default TrendCard;
