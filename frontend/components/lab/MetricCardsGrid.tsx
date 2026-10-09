import React from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { ModelMetricsSummary } from "@/lib/types";

interface MetricCardsGridProps {
  hybridMetrics?: ModelMetricsSummary;
  baselineMetrics?: ModelMetricsSummary;
}

export function MetricCardsGrid({
  hybridMetrics,
  baselineMetrics,
}: MetricCardsGridProps): React.ReactElement {
  if (!hybridMetrics) return <></>;

  const cards = [
    {
      name: "NDCG@10",
      value: hybridMetrics.ndcg_at_k.mean,
      std: hybridMetrics.ndcg_at_k.std,
      baselineVal: baselineMetrics?.ndcg_at_k.mean,
      tooltip: "Normalized Discounted Cumulative Gain: Evaluates ranking quality by penalizing relevant items appearing lower in top-10 list.",
      isHigherBetter: true,
      color: "text-emerald-400",
    },
    {
      name: "Precision@10",
      value: hybridMetrics.precision_at_k.mean,
      std: hybridMetrics.precision_at_k.std,
      baselineVal: baselineMetrics?.precision_at_k.mean,
      tooltip: "Precision@K: Fraction of top-10 recommendations that are truly relevant (rated >= 3.5 by user).",
      isHigherBetter: true,
      color: "text-sky-400",
    },
    {
      name: "Recall@10",
      value: hybridMetrics.recall_at_k.mean,
      std: hybridMetrics.recall_at_k.std,
      baselineVal: baselineMetrics?.recall_at_k.mean,
      tooltip: "Recall@K: Fraction of user's total relevant test items captured in the top-10 recommendation list.",
      isHigherBetter: true,
      color: "text-indigo-400",
    },
    {
      name: "RMSE (Error)",
      value: hybridMetrics.rmse.mean,
      std: hybridMetrics.rmse.std,
      baselineVal: baselineMetrics?.rmse.mean,
      tooltip: "Root Mean Squared Error: Square root of mean squared difference between predicted and actual ratings (Lower is better).",
      isHigherBetter: false,
      color: "text-purple-400",
    },
    {
      name: "MAE (Error)",
      value: hybridMetrics.mae.mean,
      std: hybridMetrics.mae.std,
      baselineVal: baselineMetrics?.mae.mean,
      tooltip: "Mean Absolute Error: Average absolute magnitude of rating prediction errors (Lower is better).",
      isHigherBetter: false,
      color: "text-pink-400",
    },
    {
      name: "Catalog Coverage",
      value: hybridMetrics.coverage.mean,
      std: hybridMetrics.coverage.std,
      baselineVal: baselineMetrics?.coverage.mean,
      tooltip: "Catalog Coverage: Percentage of unique movies in catalog recommended at least once across all users.",
      isHigherBetter: true,
      color: "text-teal-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const diff = c.baselineVal !== undefined ? c.value - c.baselineVal : null;
        const isBetter =
          diff !== null && (c.isHigherBetter ? diff > 0 : diff < 0);

        return (
          <div
            key={c.name}
            className="glass-card p-4 rounded-xl border border-white/10 flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">{c.name}</span>
              <Tooltip content={c.tooltip}>
                <span className="text-slate-500 hover:text-slate-300 cursor-help text-xs">
                  ℹ️
                </span>
              </Tooltip>
            </div>

            <div>
              <div className={`text-2xl font-bold font-mono ${c.color} tabular-nums`}>
                {c.value.toFixed(3)}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                ± {c.std.toFixed(3)} std
              </div>
            </div>

            {diff !== null && (
              <div className="text-[11px] font-mono flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-slate-500">vs Base:</span>
                <span
                  className={
                    isBetter
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-400"
                  }
                >
                  {diff > 0 ? `+${diff.toFixed(3)}` : diff.toFixed(3)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
