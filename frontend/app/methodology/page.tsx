"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FeedbackSummary } from "@/lib/types";

export default function MethodologyPage(): React.ReactElement {
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(null);

  useEffect(() => {
    api.getFeedbackSummary()
      .then(setFeedbackSummary)
      .catch(() => {});
  }, []);

  const pipelineStages = [
    {
      title: "Data Acquisition & Ingestion",
      desc: "Raw interaction triplets (userId, movieId, rating, timestamp) and movie metadata loaded from GroupLens MovieLens-100k.",
      rules: ["Schema integrity verification", "Deduplication of interaction pairs", "Range boundary validation [0.5, 5.0]"],
    },
    {
      title: "Feature Engineering & Splitting",
      desc: "Sparse user-item matrix construction with per-user 80/20 temporal and holdout partitioning to guarantee zero test-set leakage.",
      rules: ["Rating normalization (mean-centering)", "TF-IDF vectorization across movie genres", "Cold-start thresholding (min 5 ratings)"],
    },
    {
      title: "Multi-Model Training & Fitting",
      desc: "Independent fitting of Collaborative Filtering (ItemKNN, UserKNN, TruncatedSVD), Content-Based TF-IDF, and Hybrid Ensemble.",
      rules: ["Single fit execution per seed", "Strict isolation from test interactions", "Hyperparameter standardization"],
    },
    {
      title: "Offline Evaluation Protocol",
      desc: "Multi-seed statistical evaluation on unseen test ratings using ranking metrics (NDCG@10, Precision@10, Recall@10) and rating errors (RMSE, MAE).",
      rules: ["Paired t-tests vs baseline", "Sample standard deviation reporting (mean ± std)", "Reproducible JSON disk artifacts"],
    },
  ];

  return (
    <main className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-mono text-brand-300 w-fit mb-2">
          <span>📐</span> Academic Rigor &amp; Experimental Design
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Study Methodology &amp; Scientific Integrity
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Formal academic experimental design documentation for evaluating whether personalized machine learning models achieve statistically significant improvements over non-personalized popularity baselines.
        </p>
      </div>

      {/* Research Question & Core Hypotheses */}
      <section className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎯</span> Research Question &amp; Hypotheses
        </h2>
        <div className="p-4 rounded-xl bg-surface-200 border border-brand-500/20 text-slate-200 text-sm leading-relaxed">
          <strong className="text-white">Primary Research Question:</strong> Does a personalized hybrid recommendation architecture (combining collaborative interaction patterns and TF-IDF content similarity) significantly outperform non-personalized popularity baselines in top-K ranking quality ($NDCG@10$, $Precision@10$) on MovieLens-100k?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-surface-100 border border-white/5 flex flex-col gap-1.5">
            <span className="font-mono font-bold text-emerald-400 uppercase">Hypothesis $H_1$ (Accuracy)</span>
            <p>Personalized models achieve lower RMSE/MAE and higher NDCG@10 than the global damped mean baseline with $p &lt; 0.05$.</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-100 border border-white/5 flex flex-col gap-1.5">
            <span className="font-mono font-bold text-purple-400 uppercase">Hypothesis $H_2$ (Catalog Diversity)</span>
            <p>Hybrid and collaborative models achieve higher catalog coverage (&gt; 25%) than the popularity baseline, mitigating popularity bias.</p>
          </div>
        </div>
      </section>

      {/* End-to-End Methodology Stages Pipeline */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🔄</span> Experimental Execution Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineStages.map((stage, idx) => (
            <div key={stage.title} className="glass-card p-4 rounded-xl border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-400 font-bold">Phase 0{idx + 1}</span>
                <span className="text-slate-500">Protocol</span>
              </div>
              <h4 className="font-bold text-white text-xs">{stage.title}</h4>
              <p className="text-[11px] text-slate-300 leading-snug">{stage.desc}</p>
              <div className="mt-auto pt-2 border-t border-white/5 flex flex-col gap-1">
                {stage.rules.map((r) => (
                  <span key={r} className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <span className="text-emerald-400">✓</span> {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experimental Variables Matrix */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📊</span> Experimental Variables Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Independent Variables */}
          <div className="glass-card p-5 rounded-2xl border border-sky-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-sky-400 uppercase">Independent Variable</span>
              <span className="text-xs">Manipulated</span>
            </div>
            <h3 className="text-base font-bold text-white">Recommendation Algorithm</h3>
            <ul className="text-xs text-slate-300 space-y-2 mt-1 list-disc list-inside">
              <li><strong className="text-white">PopularityBaseline:</strong> Non-personalized Bayesian average</li>
              <li><strong className="text-white">UserKNN:</strong> Neighborhood CF on centered user vectors</li>
              <li><strong className="text-white">ItemKNN:</strong> Adjusted cosine similarity on item vectors</li>
              <li><strong className="text-white">Matrix Factorization:</strong> TruncatedSVD latent factors (k=20)</li>
              <li><strong className="text-white">ContentBased:</strong> TF-IDF genre &amp; metadata space</li>
              <li><strong className="text-white">Hybrid:</strong> Linear fusion (0.60 CF + 0.40 Content)</li>
            </ul>
          </div>

          {/* Dependent Variables */}
          <div className="glass-card p-5 rounded-2xl border border-purple-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-400 uppercase">Dependent Variables</span>
              <span className="text-xs">Measured</span>
            </div>
            <h3 className="text-base font-bold text-white">Evaluation Metrics</h3>
            <ul className="text-xs text-slate-300 space-y-2 mt-1 list-disc list-inside">
              <li><strong className="text-white">NDCG@10:</strong> Position-discounted ranking gain</li>
              <li><strong className="text-white">Precision@10:</strong> Relevant items / 10</li>
              <li><strong className="text-white">Recall@10:</strong> Captured relevant test items</li>
              <li><strong className="text-white">RMSE / MAE:</strong> Rating prediction errors</li>
              <li><strong className="text-white">Catalog Coverage:</strong> % of catalog items recommended</li>
              <li><strong className="text-white">Online Feedback:</strong> User satisfaction proxy (thumbs rate)</li>
            </ul>
          </div>

          {/* Controlled Variables */}
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase">Controlled Variables</span>
              <span className="text-xs">Held Constant</span>
            </div>
            <h3 className="text-base font-bold text-white">Standard Protocol</h3>
            <ul className="text-xs text-slate-300 space-y-2 mt-1 list-disc list-inside">
              <li><strong className="text-white">Dataset:</strong> Fixed MovieLens-100k snapshot</li>
              <li><strong className="text-white">Split Ratio:</strong> 70% Train, 10% Val, 20% Test</li>
              <li><strong className="text-white">Seeds:</strong> Identical pseudo-random seeds [42, 43, 44]</li>
              <li><strong className="text-white">Threshold:</strong> Rating &gt;= 3.5 considered relevant</li>
              <li><strong className="text-white">Hardware:</strong> Uniform CPU inference runtime</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Research Integrity & Anti-Fabrication Trust Checklist */}
      <section className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🛡️</span> Research Integrity &amp; Trust Commitments
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "Zero Test-Set Leakage", desc: "Test ratings are completely partitioned before feature extraction or similarity fitting." },
            { title: "No Fabricated Metrics", desc: "Every number, chart point, and table row is computed live from actual model executions on disk." },
            { title: "Multi-Seed Validation", desc: "All metrics report sample variance (mean ± std) across multiple seeds to prevent cherry-picking." },
            { title: "Statistical Significance", desc: "Paired t-tests rigorously assess whether improvements vs baseline exceed random noise (p < 0.05)." },
            { title: "Deterministic Reproducibility", desc: "All random number generators (numpy, scikit-learn, splitters) are initialized with fixed seeds." },
            { title: "Raw Artifact Export", desc: "Full metrics.json and config.json are serialized to disk and verifiable by any external auditor." },
          ].map((item) => (
            <div key={item.title} className="p-3.5 rounded-xl bg-surface-200 border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <span>✓</span>
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Online User Satisfaction Proxy Disclaimer */}
      <section className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>👥</span> Online User Satisfaction Proxy
            </h2>
            <p className="text-xs text-slate-400">
              Live aggregation of human evaluator feedback recorded during interactive sessions.
            </p>
          </div>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono text-amber-300 border border-amber-500/30">
            Online Proxy Metric
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-200 border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Feedback Submissions</span>
            <span className="text-2xl font-bold font-mono text-white">
              {feedbackSummary?.total_feedback ?? 0}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-surface-200 border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Thumbs Up (Relevant)</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {feedbackSummary?.thumbs_up_count ?? 0}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-surface-200 border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Thumbs Down</span>
            <span className="text-2xl font-bold font-mono text-rose-400">
              {feedbackSummary?.thumbs_down_count ?? 0}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-surface-200 border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Positive Relevance Rate</span>
            <span className="text-2xl font-bold font-mono text-brand-400">
              {feedbackSummary ? `${(feedbackSummary.positive_rate * 100).toFixed(1)}%` : "0.0%"}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic bg-surface-200/50 p-3 rounded-lg border border-white/5">
          <strong className="text-slate-300">Methodological Note:</strong> Online feedback serves as a real-time engagement proxy to complement offline benchmark evaluations. It does not replace controlled offline train/test splits.
        </p>
      </section>
    </main>
  );
}
