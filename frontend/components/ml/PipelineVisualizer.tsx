"use client";

import React, { useState } from "react";

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "User Preferences",
    desc: "Active user ratings (1.0 - 5.0) collected to resolve cold start",
    icon: "⭐",
  },
  {
    step: "02",
    title: "Feature Engineering",
    desc: "Centered rating normalization + TF-IDF genre space mapping",
    icon: "⚙️",
  },
  {
    step: "03",
    title: "Algorithm Inference",
    desc: "Selected model calculates dot products / cosine similarities",
    icon: "🧠",
  },
  {
    step: "04",
    title: "Candidate Ranking",
    desc: "Unseen items ranked by predicted scores & sorted descending",
    icon: "📊",
  },
  {
    step: "05",
    title: "Transparent Explainability",
    desc: "Generates interpretable why-recommended evidence vectors",
    icon: "🎯",
  },
];

export function PipelineVisualizer(): React.ReactElement {
  const [activeStep, setActiveStep] = useState(2);

  return (
    <div className="flex flex-col gap-3 glass-card p-4 sm:p-5 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          System Architecture Pipeline
        </h3>
        <span className="text-[11px] font-mono text-brand-400">
          End-to-End Inference Flow
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {PIPELINE_STEPS.map((s, idx) => {
          const isSelected = activeStep === idx;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(idx)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all text-xs ${
                isSelected
                  ? "bg-brand-500/10 border-brand-500/50 shadow-glow-sm"
                  : "bg-surface-200/50 border-white/5 hover:border-white/20 hover:bg-surface-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">{s.icon}</span>
                <span className="font-mono text-[10px] text-slate-500 font-bold">
                  {s.step}
                </span>
              </div>
              <h4 className="font-semibold text-slate-200 text-xs">{s.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {s.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
