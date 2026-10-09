"use client";

import React from "react";
import { MODEL_CONFIGS, ModelName } from "@/lib/types";

interface ModelSelectorProps {
  selectedModel: ModelName;
  onSelectModel: (model: ModelName) => void;
  disabled?: boolean;
}

const MODELS_LIST: ModelName[] = [
  "Hybrid",
  "ItemKNN",
  "UserKNN",
  "MatrixFactorization",
  "ContentBased",
  "PopularityBaseline",
];

export function ModelSelector({
  selectedModel,
  onSelectModel,
  disabled = false,
}: ModelSelectorProps): React.ReactElement {
  const current = MODEL_CONFIGS[selectedModel];

  return (
    <div className="flex flex-col gap-3">
      {/* Segmented Control Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-200/90 border border-white/10 backdrop-blur-md">
        {MODELS_LIST.map((name) => {
          const cfg = MODEL_CONFIGS[name];
          const isSelected = selectedModel === name;

          return (
            <button
              key={name}
              type="button"
              disabled={disabled}
              onClick={() => onSelectModel(name)}
              className={`relative flex-1 min-w-[130px] rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
                isSelected
                  ? "bg-surface-50 text-white shadow-lg border border-white/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              <span className="truncate">{cfg.label}</span>
              {isSelected && (
                <span
                  className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Contextual Model Overview Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface-100/50 border border-white/5 text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className="rounded px-2 py-0.5 font-mono text-[11px] font-bold border"
            style={{
              color: current.color,
              borderColor: `${current.color}40`,
              backgroundColor: `${current.color}15`,
            }}
          >
            {current.label}
          </span>
          <span className="text-slate-300 font-medium">
            {current.shortDescription}
          </span>
        </div>
        <span className="text-slate-500 text-[11px] max-w-md text-left sm:text-right hidden md:block">
          {current.description}
        </span>
      </div>
    </div>
  );
}
