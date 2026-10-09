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

interface RankingPerformanceChartProps {
  models: Record<string, ModelMetricsSummary>;
}

export function RankingPerformanceChart({
  models,
}: RankingPerformanceChartProps): React.ReactElement {
  const data = (Object.keys(models) as ModelName[]).map((name) => {
    const m = models[name];
    const cfg = MODEL_CONFIGS[name];
    return {
      name: cfg?.label ?? name,
      precision: parseFloat((m.precision_at_k.mean * 100).toFixed(2)),
      recall: parseFloat((m.recall_at_k.mean * 100).toFixed(2)),
      ndcg: parseFloat((m.ndcg_at_k.mean * 100).toFixed(2)),
    };
  });

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
      <div>
        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Ranking Quality: NDCG@10, Precision@10 &amp; Recall@10 (%)
        </h4>
        <p className="text-[11px] text-slate-400">
          Higher values indicate superior top-10 relevance and catalog discovery.
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
            <YAxis stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 10 }} unit="%" />
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
            <Bar dataKey="ndcg" name="NDCG@10" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="precision" name="Precision@10" fill="#0284C7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recall" name="Recall@10" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
