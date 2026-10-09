import React from "react";

export function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-white/10 bg-[#070A12] py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-semibold text-slate-300">
            Movie Recommendation System &amp; Experiment Lab
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span>Final Year ML Academic Capstone</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Dataset: GroupLens MovieLens</span>
          <span>•</span>
          <span>Strict Evaluation Protocol</span>
          <span>•</span>
          <span className="text-emerald-400">Zero Leakage</span>
        </div>
      </div>
    </footer>
  );
}
