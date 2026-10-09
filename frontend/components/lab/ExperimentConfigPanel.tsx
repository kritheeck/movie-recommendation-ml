"use client";

import React, { useState } from "react";

interface ExperimentConfigPanelProps {
  onRunExperiment: (config: {
    k: number;
    seeds: number[];
    split_strategy: string;
    rating_threshold: number;
  }) => void;
  isRunning: boolean;
}

export function ExperimentConfigPanel({
  onRunExperiment,
  isRunning,
}: ExperimentConfigPanelProps): React.ReactElement {
  const [k, setK] = useState(10);
  const [seeds, setSeeds] = useState("42, 43, 44");
  const [splitStrategy, setSplitStrategy] = useState("user_holdout");
  const [ratingThreshold, setRatingThreshold] = useState(3.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSeeds = seeds
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    onRunExperiment({
      k,
      seeds: parsedSeeds.length > 0 ? parsedSeeds : [42, 43, 44],
      split_strategy: splitStrategy,
      rating_threshold: ratingThreshold,
    });
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Experiment Protocol Parameters
          </h2>
          <p className="text-xs text-slate-400">
            Configure controlled multi-seed offline evaluation parameters.
          </p>
        </div>
        <span className="rounded bg-brand-500/20 px-2 py-0.5 font-mono text-[11px] text-brand-300 border border-brand-500/30">
          Controlled Evaluation
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top-K */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 font-mono">
            Recommendation Cutoff (Top-K)
          </label>
          <select
            value={k}
            disabled={isRunning}
            onChange={(e) => setK(parseInt(e.target.value))}
            className="rounded-xl border border-white/10 bg-surface-200 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
          >
            <option value={5}>Top-5 Items</option>
            <option value={10}>Top-10 Items (Standard)</option>
            <option value={20}>Top-20 Items</option>
          </select>
        </div>

        {/* Random Seeds */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 font-mono">
            Evaluation Random Seeds
          </label>
          <input
            type="text"
            value={seeds}
            disabled={isRunning}
            onChange={(e) => setSeeds(e.target.value)}
            placeholder="42, 43, 44"
            className="rounded-xl border border-white/10 bg-surface-200 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Split Strategy */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 font-mono">
            Train / Test Split Strategy
          </label>
          <select
            value={splitStrategy}
            disabled={isRunning}
            onChange={(e) => setSplitStrategy(e.target.value)}
            className="rounded-xl border border-white/10 bg-surface-200 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="user_holdout">Per-User 80/20 Holdout (Standard)</option>
            <option value="temporal">Temporal Split (Time-Ordered)</option>
            <option value="random">Global Random Split</option>
          </select>
        </div>

        {/* Rating Relevance Threshold */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 font-mono">
            Relevance Threshold
          </label>
          <select
            value={ratingThreshold}
            disabled={isRunning}
            onChange={(e) => setRatingThreshold(parseFloat(e.target.value))}
            className="rounded-xl border border-white/10 bg-surface-200 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
          >
            <option value={3.0}>&gt;= 3.0 Stars</option>
            <option value={3.5}>&gt;= 3.5 Stars (Standard)</option>
            <option value={4.0}>&gt;= 4.0 Stars (Strict)</option>
          </select>
        </div>

        {/* Primary CTA */}
        <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400 font-mono">
            Executes full train/test multi-seed pipeline with zero data leakage.
          </span>
          <button
            type="submit"
            disabled={isRunning}
            className="btn-primary min-w-[200px]"
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Evaluating Models...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Run Controlled Experiment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
