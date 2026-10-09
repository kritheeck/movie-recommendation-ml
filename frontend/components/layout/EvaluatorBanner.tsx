"use client";

import React, { useState } from "react";

export function EvaluatorBanner(): React.ReactElement {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return <></>;

  return (
    <div className="border-b border-brand-500/20 bg-gradient-to-r from-brand-950/40 via-surface-100/40 to-brand-950/40 px-4 py-2.5 text-xs text-slate-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded bg-brand-500/20 px-2 py-0.5 font-mono font-semibold text-brand-300 border border-brand-500/40">
            RESEARCH VIVA MODE
          </span>
          <span>
            <strong className="text-white">Research Question:</strong> Can personalized ML recommendation algorithms (CF, Content, Hybrid) achieve statistically significant accuracy gains over non-personalized baselines on MovieLens?
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block text-slate-400 font-mono text-[11px]">
            Dataset: MovieLens-100k
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-slate-300 px-1"
            title="Dismiss Evaluator Note"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
