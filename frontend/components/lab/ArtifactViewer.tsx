"use client";

import React, { useState } from "react";
import { ExperimentRunSummary } from "@/lib/types";

interface ArtifactViewerProps {
  experiment: ExperimentRunSummary | null;
}

export function ArtifactViewer({
  experiment,
}: ArtifactViewerProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"metrics" | "config">("metrics");
  const [copied, setCopied] = useState(false);

  if (!experiment) return <></>;

  const jsonContent =
    activeTab === "metrics"
      ? JSON.stringify(
          {
            experiment_id: experiment.experiment_id,
            timestamp: experiment.created_at,
            models: experiment.models,
            raw_runs: experiment.raw_runs,
          },
          null,
          2
        )
      : JSON.stringify(experiment.config, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <span>📦</span> Reproducible Disk Artifact: {experiment.experiment_id}
          </h4>
          <p className="text-[11px] text-slate-400">
            Raw serialized experiment outputs saved to disk in <code className="text-brand-300">experiments/</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center bg-surface-200 rounded-lg p-1 border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("metrics")}
              className={`px-3 py-1 rounded-md font-mono transition-colors ${
                activeTab === "metrics" ? "bg-surface-50 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              metrics.json
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`px-3 py-1 rounded-md font-mono transition-colors ${
                activeTab === "config" ? "bg-surface-50 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              config.json
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {copied ? "✓ Copied" : "Copy JSON"}
          </button>
        </div>
      </div>

      <pre className="h-60 overflow-y-auto rounded-xl bg-[#04060A] p-4 text-[11px] font-mono text-emerald-400/90 border border-white/5 scrollbar-thin">
        {jsonContent}
      </pre>
    </div>
  );
}
