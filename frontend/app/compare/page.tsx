"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  MODEL_CONFIGS,
  ModelName,
  ScoredMovieItem,
} from "@/lib/types";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { useMutation } from "convex/react";
import { api as convexApi } from "@/convex/_generated/api";

const ALL_MODELS: ModelName[] = [
  "Hybrid",
  "ItemKNN",
  "UserKNN",
  "MatrixFactorization",
  "ContentBased",
  "PopularityBaseline",
];

export default function BlindComparePage(): React.ReactElement {
  const [userId, setUserId] = useState<string>("evaluator-session-01");
  const submitConvexFeedback = useMutation(convexApi.feedback.submitFeedback);
  const [modelA, setModelA] = useState<ModelName>("Hybrid");
  const [modelB, setModelB] = useState<ModelName>("PopularityBaseline");
  const [recsA, setRecsA] = useState<ScoredMovieItem[]>([]);
  const [recsB, setRecsB] = useState<ScoredMovieItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [votedChoice, setVotedChoice] = useState<"A" | "B" | "tie" | null>(null);


  useEffect(() => {
    const stored = localStorage.getItem("demo_user_id");
    const activeUid = stored ?? "evaluator-session-01";
    setUserId(activeUid);
    loadComparison(activeUid, modelA, modelB);
  }, []);

  const loadComparison = async (uid: string, a: ModelName, b: ModelName) => {
    setIsLoading(true);
    setRevealed(false);
    setVotedChoice(null);
    try {
      const [resA, resB] = await Promise.all([
        api.getRecommendations(uid, a, 6),
        api.getRecommendations(uid, b, 6),
      ]);
      setRecsA(resA.items);
      setRecsB(resB.items);
    } catch {
      setRecsA([]);
      setRecsB([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (choice: "A" | "B" | "tie") => {
    setVotedChoice(choice);
    setRevealed(true);
    try {
      // Record preference proxy
      const chosenModel = choice === "A" ? modelA : choice === "B" ? modelB : "Tie";
      await api.submitFeedback(userId, {
        model_name: `BlindCompare_${chosenModel}`,
        movie_id: 1,
        thumbs_up: true,
      });
      await submitConvexFeedback({
        userId,
        modelName: `BlindCompare_${chosenModel}`,
        movieId: 1,
        movieTitle: `Blind Compare A/B (${modelA} vs ${modelB})`,
        thumbsUp: true,
        comment: `User selected candidate ${choice} (winner: ${chosenModel})`,
      });
    } catch {
      // ignore feedback failure
    }

  };

  const handleNewPair = (newA: ModelName, newB: ModelName) => {
    setModelA(newA);
    setModelB(newB);
    loadComparison(userId, newA, newB);
  };

  const cfgA = MODEL_CONFIGS[modelA];
  const cfgB = MODEL_CONFIGS[modelB];

  return (
    <main className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-mono text-purple-300 w-fit mb-2">
            <span>⚖️</span> Double-Blind Human Subject Preference Evaluation
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Blind Recommendation A/B Compare
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Evaluate two recommendation candidate lists without knowing which algorithm generated them to prevent cognitive bias.
          </p>
        </div>

        {/* Algorithm Pair Custom Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-100 p-2.5 rounded-xl border border-white/10 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-mono text-[11px]">System A:</span>
            <select
              value={modelA}
              onChange={(e) => handleNewPair(e.target.value as ModelName, modelB)}
              className="bg-surface-200 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
            >
              {ALL_MODELS.map((m) => (
                <option key={m} value={m}>
                  {MODEL_CONFIGS[m]?.label ?? m}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 font-bold">vs</span>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-mono text-[11px]">System B:</span>
            <select
              value={modelB}
              onChange={(e) => handleNewPair(modelA, e.target.value as ModelName)}
              className="bg-surface-200 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
            >
              {ALL_MODELS.map((m) => (
                <option key={m} value={m}>
                  {MODEL_CONFIGS[m]?.label ?? m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Voting Banner */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center gap-4 bg-gradient-to-r from-surface-100 via-surface-200 to-surface-100 shadow-xl">
        {!revealed ? (
          <>
            <div>
              <h2 className="text-lg font-bold text-white">
                Which recommendation set better matches your viewing taste?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Inspect both candidate columns below, then cast your unbiased preference vote.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleVote("A")}
                disabled={isLoading}
                className="btn-primary px-6 py-2.5 text-sm bg-brand-500 hover:bg-brand-600"
              >
                <span>👈</span> Prefer Candidate A
              </button>
              <button
                onClick={() => handleVote("tie")}
                disabled={isLoading}
                className="btn-secondary px-5 py-2.5 text-sm"
              >
                <span>🤝</span> Both are Equal
              </button>
              <button
                onClick={() => handleVote("B")}
                disabled={isLoading}
                className="btn-primary px-6 py-2.5 text-sm bg-purple-600 hover:bg-purple-700"
              >
                Prefer Candidate B <span>👉</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 animate-slide-up w-full">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
              ✓ De-Blinding Complete — Preference Recorded: {votedChoice === "tie" ? "Equal Quality" : `System ${votedChoice}`}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full text-left mt-2">
              <div className="glass-card p-4 rounded-xl border border-sky-500/30 bg-surface-200/90">
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">Candidate A Unmasked</span>
                <h4 className="text-base font-bold text-white mt-1">{cfgA.label}</h4>
                <p className="text-xs text-slate-300 mt-1">{cfgA.description}</p>
              </div>
              <div className="glass-card p-4 rounded-xl border border-purple-500/30 bg-surface-200/90">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase">Candidate B Unmasked</span>
                <h4 className="text-base font-bold text-white mt-1">{cfgB.label}</h4>
                <p className="text-xs text-slate-300 mt-1">{cfgB.description}</p>
              </div>
            </div>
            <button
              onClick={() => loadComparison(userId, modelA, modelB)}
              className="btn-secondary text-xs px-5 py-2 mt-2"
            >
              🔄 Reset Comparison &amp; Evaluate Another Pair
            </button>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column A */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-100 border border-white/10">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-brand-400" />
              <h3 className="font-bold text-base text-white">
                {revealed ? cfgA.label : "Candidate System A"}
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {revealed ? "Personalized Algorithm" : "Masked Model"}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {recsA.map((item) => (
                <MovieCard
                  key={item.movie.id}
                  movie={item.movie}
                  score={revealed ? item.score : undefined}
                  rank={item.rank}
                  reason={revealed ? item.reason : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Column B */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-100 border border-white/10">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-purple-400" />
              <h3 className="font-bold text-base text-white">
                {revealed ? cfgB.label : "Candidate System B"}
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {revealed ? "Comparison Algorithm" : "Masked Model"}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {recsB.map((item) => (
                <MovieCard
                  key={item.movie.id}
                  movie={item.movie}
                  score={revealed ? item.score : undefined}
                  rank={item.rank}
                  reason={revealed ? item.reason : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
