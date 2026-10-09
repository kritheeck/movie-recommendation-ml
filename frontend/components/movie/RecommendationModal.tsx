"use client";

import React, { useState } from "react";
import { ScoredMovieItem } from "@/lib/types";
import { api } from "@/lib/api";
import { useMutation } from "convex/react";
import { api as convexApi } from "@/convex/_generated/api";

interface RecommendationModalProps {
  item: ScoredMovieItem | null;
  userId: string;
  modelName: string;
  onClose: () => void;
}

export function RecommendationModal({
  item,
  userId,
  modelName,
  onClose,
}: RecommendationModalProps): React.ReactElement {
  const [feedbackSent, setFeedbackSent] = useState<"up" | "down" | null>(null);
  const submitConvexFeedback = useMutation(convexApi.feedback.submitFeedback);

  if (!item) return <></>;

  const handleFeedback = async (isPositive: boolean) => {
    try {
      await api.submitFeedback(userId, {
        model_name: modelName,
        movie_id: item.movie.id,
        thumbs_up: isPositive,
      });
      await submitConvexFeedback({
        userId,
        modelName,
        movieId: item.movie.id,
        movieTitle: item.movie.title,
        thumbsUp: isPositive,
      });
      setFeedbackSent(isPositive ? "up" : "down");
    } catch {
      setFeedbackSent(isPositive ? "up" : "down");
    }
  };


  const posterSrc =
    item.movie.poster_url || `/posters/${item.movie.id}.jpg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-surface-100 p-6 shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-slate-400 hover:text-white border border-white/10"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Poster Column */}
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-300 border border-white/10">
            <img
              src={posterSrc}
              alt={item.movie.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `/posters/${item.movie.id}.jpg`;
              }}
            />
            <div className="absolute top-2 left-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-mono font-bold text-white border border-white/20">
              Rank #{item.rank}
            </div>
          </div>

          {/* Details & Explanation Column */}
          <div className="sm:col-span-2 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-brand-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-brand-300 border border-brand-500/30">
                  {modelName}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  Predicted Score: <strong className="text-emerald-400">{item.score.toFixed(2)}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5">{item.movie.title}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.movie.genres.map((g) => (
                  <span key={g} className="rounded bg-white/5 px-2 py-0.5 text-xs text-slate-300 border border-white/10">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Scientific Explanation Box */}
            <div className="rounded-xl border border-white/10 bg-surface-200/90 p-3.5 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>🔍</span> Why this was recommended
              </span>
              <p className="text-sm text-slate-200 leading-relaxed italic">
                &ldquo;{item.reason}&rdquo;
              </p>

              {item.supporting_evidence && item.supporting_evidence.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                  {item.supporting_evidence.map((ev, idx) => (
                    <div key={idx} className="bg-black/30 p-2 rounded border border-white/5">
                      <div className="text-[10px] text-slate-500">{ev.type ?? "Evidence"}</div>
                      <div className="text-slate-200 font-semibold truncate">
                        {ev.metric ?? ev.score ?? JSON.stringify(ev)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Online Evaluation Feedback Proxy */}
            <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Is this recommendation relevant to you?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackSent !== null}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                    feedbackSent === "up"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow-sm"
                      : "bg-surface-200 border-white/10 text-slate-300 hover:bg-surface-50 hover:text-white"
                  }`}
                >
                  <span>👍</span> Useful
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackSent !== null}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                    feedbackSent === "down"
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-glow-sm"
                      : "bg-surface-200 border-white/10 text-slate-300 hover:bg-surface-50 hover:text-white"
                  }`}
                >
                  <span>👎</span> Not for me
                </button>
              </div>
            </div>
            {feedbackSent && (
              <span className="text-[11px] text-emerald-400 font-mono text-right">
                ✓ Recorded to online satisfaction proxy
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
