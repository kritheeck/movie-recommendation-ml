"use client";

import React from "react";
import { MODEL_CONFIGS, ModelMetricsSummary, ModelName } from "@/lib/types";

interface AcademicBenchmarkTableProps {
  models: Record<string, ModelMetricsSummary>;
}

export function AcademicBenchmarkTable({
  models,
}: AcademicBenchmarkTableProps): React.ReactElement {
  const modelKeys = Object.keys(models) as ModelName[];

  if (modelKeys.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-xs text-slate-400">
        No experiment metrics recorded yet. Click &ldquo;Run Controlled Experiment&rdquo; above.
      </div>
    );
  }

  // Find best values for bolding
  const bestNDCG = Math.max(...modelKeys.map((k) => models[k]?.ndcg_at_k.mean ?? 0));
  const bestPrecision = Math.max(...modelKeys.map((k) => models[k]?.precision_at_k.mean ?? 0));
  const bestRecall = Math.max(...modelKeys.map((k) => models[k]?.recall_at_k.mean ?? 0));
  const bestRMSE = Math.min(...modelKeys.map((k) => models[k]?.rmse.mean ?? 999));
  const bestMAE = Math.min(...modelKeys.map((k) => models[k]?.mae.mean ?? 999));
  const bestCoverage = Math.max(...modelKeys.map((k) => models[k]?.coverage.mean ?? 0));

  return (
    <div className="glass-card overflow-hidden rounded-2xl border border-white/10 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 border-b border-white/10 bg-surface-200/50">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <span>📋</span> Academic Benchmark Comparison Table
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Reported as mean ± sample standard deviation across independent random seeds.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Best Score
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            * p &lt; 0.05 vs Baseline
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 font-mono">
          <thead className="bg-surface-300 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Algorithm</th>
              <th className="py-3 px-4">NDCG@10 ↑</th>
              <th className="py-3 px-4">Precision@10 ↑</th>
              <th className="py-3 px-4">Recall@10 ↑</th>
              <th className="py-3 px-4">RMSE ↓</th>
              <th className="py-3 px-4">MAE ↓</th>
              <th className="py-3 px-4">Coverage ↑</th>
              <th className="py-3 px-4 text-center">Sig. vs Base</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {modelKeys.map((name) => {
              const m = models[name];
              const cfg = MODEL_CONFIGS[name] ?? {
                label: name,
                color: "#64748B",
              };
              const isSignificant = m?.significance_vs_baseline?.statistically_significant ?? false;

              return (
                <tr key={name} className="hover:bg-white/5 transition-colors">
                  {/* Model Name */}
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span>{cfg.label}</span>
                  </td>

                  {/* NDCG */}
                  <td className={`py-3.5 px-4 tabular-nums ${m.ndcg_at_k.mean === bestNDCG ? "text-emerald-400 font-bold" : ""}`}>
                    {m.ndcg_at_k.mean.toFixed(3)} <span className="text-[10px] text-slate-500">±{m.ndcg_at_k.std.toFixed(3)}</span>
                  </td>

                  {/* Precision */}
                  <td className={`py-3.5 px-4 tabular-nums ${m.precision_at_k.mean === bestPrecision ? "text-emerald-400 font-bold" : ""}`}>
                    {m.precision_at_k.mean.toFixed(3)} <span className="text-[10px] text-slate-500">±{m.precision_at_k.std.toFixed(3)}</span>
                  </td>

                  {/* Recall */}
                  <td className={`py-3.5 px-4 tabular-nums ${m.recall_at_k.mean === bestRecall ? "text-emerald-400 font-bold" : ""}`}>
                    {m.recall_at_k.mean.toFixed(3)} <span className="text-[10px] text-slate-500">±{m.recall_at_k.std.toFixed(3)}</span>
                  </td>

                  {/* RMSE */}
                  <td className={`py-3.5 px-4 tabular-nums ${m.rmse.mean === bestRMSE ? "text-emerald-400 font-bold" : ""}`}>
                    {m.rmse.mean.toFixed(3)} <span className="text-[10px] text-slate-500">±{m.rmse.std.toFixed(3)}</span>
                  </td>

                  {/* MAE */}
                  <td className={`py-3.5 px-4 tabular-nums ${m.mae.mean === bestMAE ? "text-emerald-400 font-bold" : ""}`}>
                    {m.mae.mean.toFixed(3)} <span className="text-[10px] text-slate-500">±{m.mae.std.toFixed(3)}</span>
                  </td>

                  {/* Coverage */}
                  <td className={`py-3.5 px-4 tabular-nums ${m.coverage.mean === bestCoverage ? "text-emerald-400 font-bold" : ""}`}>
                    {(m.coverage.mean * 100).toFixed(1)}% <span className="text-[10px] text-slate-500">±{(m.coverage.std * 100).toFixed(1)}%</span>
                  </td>

                  {/* Significance */}
                  <td className="py-3.5 px-4 text-center">
                    {name === "PopularityBaseline" ? (
                      <span className="text-[10px] text-slate-500 font-sans">Control Base</span>
                    ) : isSignificant ? (
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        p &lt; 0.05 *
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">p = {m.significance_vs_baseline?.p_value.toFixed(3) ?? "n/a"}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
