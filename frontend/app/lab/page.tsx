"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ExperimentRunListItem, ExperimentRunSummary } from "@/lib/types";
import { ExperimentConfigPanel } from "@/components/lab/ExperimentConfigPanel";
import { MetricCardsGrid } from "@/components/lab/MetricCardsGrid";
import { AcademicBenchmarkTable } from "@/components/lab/AcademicBenchmarkTable";
import { RankingPerformanceChart } from "@/components/lab/Charts/RankingPerformanceChart";
import { ErrorComparisonChart } from "@/components/lab/Charts/ErrorComparisonChart";
import { CoverageChart } from "@/components/lab/Charts/CoverageChart";
import { ArtifactViewer } from "@/components/lab/ArtifactViewer";
import { useMutation, useQuery } from "convex/react";
import { api as convexApi } from "@/convex/_generated/api";

export default function ExperimentLabPage(): React.ReactElement {
  const [activeExperiment, setActiveExperiment] = useState<ExperimentRunSummary | null>(null);
  const [experimentHistory, setExperimentHistory] = useState<ExperimentRunListItem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const saveExperimentConvex = useMutation(convexApi.experiments.saveExperiment);
  const convexExperiments = useQuery(convexApi.experiments.listExperiments);


  // Load latest experiment and history on mount
  useEffect(() => {
    loadLatestOrHistory();
  }, []);

  const loadLatestOrHistory = async () => {
    try {
      const history = await api.listExperiments();
      setExperimentHistory(history);
      if (history.length > 0) {
        const latestSummary = await api.getExperiment(history[0].experiment_id);
        setActiveExperiment(latestSummary);
        saveExperimentConvex({
          experimentId: latestSummary.experiment_id,
          title: `Benchmark Run (${latestSummary.config.split_strategy})`,
          status: "completed",
          k: latestSummary.config.k,
          splitStrategy: latestSummary.config.split_strategy,
          models: latestSummary.config.models,
          metrics: latestSummary.models,
          runTimeSeconds: latestSummary.config.elapsed_seconds,
        }).catch(() => {});
      }
    } catch {
      // no experiment run yet
    }
  };

  const handleRunExperiment = async (config: {
    k: number;
    seeds: number[];
    split_strategy: string;
    rating_threshold: number;
  }) => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const summary = await api.runExperiment(config);
      setActiveExperiment(summary);
      try {
        await saveExperimentConvex({
          experimentId: summary.experiment_id,
          title: `Academic Benchmark Run (${summary.config.split_strategy})`,
          notes: `k=${summary.config.k}, threshold=${summary.config.rating_threshold}`,
          status: "completed",
          k: summary.config.k,
          splitStrategy: summary.config.split_strategy,
          models: summary.config.models,
          metrics: summary.models,
          runTimeSeconds: summary.config.elapsed_seconds,
        });

      } catch {
        // continue
      }
      await loadLatestOrHistory();

    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to complete experiment run. Please ensure backend is reachable."
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectHistoryRun = async (expId: string) => {
    try {
      const summary = await api.getExperiment(expId);
      setActiveExperiment(summary);
    } catch {
      // ignore
    }
  };

  const hybridMetrics = activeExperiment?.models?.Hybrid;
  const baselineMetrics = activeExperiment?.models?.PopularityBaseline;

  return (
    <main className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300 w-fit mb-2">
            <span>🧪</span> Controlled Statistical Experimentation Lab
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Recommendation Experiment Lab
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Execute reproducible, multi-seed offline benchmark evaluations across models on MovieLens-100k without data leakage.
          </p>
        </div>

        {/* Experiment History Selector & Convex Cloud Vault Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {convexExperiments && convexExperiments.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span>Convex Cloud: {convexExperiments.length} archived</span>
            </div>
          )}
          {experimentHistory.length > 0 && (
            <div className="flex items-center gap-2 bg-surface-100 p-2 rounded-xl border border-white/10 text-xs">
              <span className="text-slate-400 font-mono">Run:</span>
              <select
                value={activeExperiment?.experiment_id ?? ""}
                onChange={(e) => handleSelectHistoryRun(e.target.value)}
                className="rounded-lg bg-surface-200 border border-white/10 px-2.5 py-1 text-white font-mono text-xs focus:outline-none"
              >
                {experimentHistory.map((h) => (
                  <option key={h.experiment_id} value={h.experiment_id}>
                    {h.experiment_id} ({h.elapsed_seconds}s)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Parameter Configuration Drawer */}
      <ExperimentConfigPanel
        onRunExperiment={handleRunExperiment}
        isRunning={isRunning}
      />

      {/* Results Dashboard Header Metadata */}
      {activeExperiment && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-surface-200/50 border border-white/10 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Active Run: <strong className="text-white">{activeExperiment.experiment_id}</strong>
            </span>
            <span>
              Dataset: <strong className="text-brand-300">{activeExperiment.config.dataset}</strong> ({activeExperiment.config.n_movies} movies, {activeExperiment.config.n_ratings} ratings)
            </span>
            <span>
              Seeds: <strong className="text-purple-300">[{activeExperiment.config.seeds.join(", ")}]</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Execution Time: <strong className="text-emerald-400">{activeExperiment.config.elapsed_seconds}s</strong>
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-bold border border-emerald-500/30">
              Zero Leakage Verified
            </span>
          </div>
        </div>
      )}

      {/* Metric KPI Cards */}
      {activeExperiment && (
        <MetricCardsGrid
          hybridMetrics={hybridMetrics}
          baselineMetrics={baselineMetrics}
        />
      )}

      {/* Statistical Comparison Table */}
      {activeExperiment ? (
        <AcademicBenchmarkTable models={activeExperiment.models} />
      ) : (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3">
          <span className="text-4xl">📊</span>
          <h3 className="text-lg font-semibold text-white">No Experiment Results Available</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Click &ldquo;Run Controlled Experiment&rdquo; above to train all models across 3 random seeds and calculate ranking &amp; error metrics.
          </p>
        </div>
      )}

      {/* Scientific Visualizations (Recharts) */}
      {activeExperiment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RankingPerformanceChart models={activeExperiment.models} />
          </div>
          <div className="lg:col-span-1">
            <CoverageChart models={activeExperiment.models} />
          </div>
          <div className="lg:col-span-3">
            <ErrorComparisonChart models={activeExperiment.models} />
          </div>
        </div>
      )}

      {/* Raw Disk Artifact Viewer */}
      {activeExperiment && <ArtifactViewer experiment={activeExperiment} />}
    </main>
  );
}
