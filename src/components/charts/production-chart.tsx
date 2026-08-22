"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PRODUCTION_STAGE_LABELS, type ProductionStage } from "@/lib/constants";

const COLORS = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#14b8a6", "#ea580c"];

export function ProductionChart({
  data,
}: {
  data: { stage: ProductionStage; count: number }[];
}) {
  const chartData = data.map((d) => ({
    stage: PRODUCTION_STAGE_LABELS[d.stage],
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="stage"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
