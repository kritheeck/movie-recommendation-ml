"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MODEL_CONFIGS, ModelMetricsSummary, ModelName } from "@/lib/types";

interface ErrorComparisonChartProps {
  models: Record<string, ModelMetricsSummary>;
}

export function ErrorComparisonChart({
  models,
}: ErrorComparisonChartProps): React.ReactElement {
  const data = (Object.keys(models) as ModelName[]).map((name) => {
    const m = models[name];
    const cfg = MODEL_CONFIGS[name];
    return {
      name: cfg?.label ?? name,
      rmse: parseFloat(m.rmse.mean.toFixed(3)),
      mae: parseFloat(m.mae.mean.toFixed(3)),
    };
  });

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
      <div>
        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Rating Prediction Error: RMSE &amp; MAE
        </h4>
        <p className="text-[11px] text-slate-400">
          Lower values indicate superior rating estimation fidelity.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 10 }} domain={[0, 1.5]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F1523",
                borderColor: "rgba(255,255,255,0.15)",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Bar dataKey="rmse" name="RMSE" fill="#EC4899" radius={[4, 4, 0, 0]} />
            <Bar dataKey="mae" name="MAE" fill="#A855F7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
