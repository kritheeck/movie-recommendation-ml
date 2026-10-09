"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ConvexDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "movies" | "ratings" | "watchlist" | "feedback" | "experiments" | "users";

export function ConvexDatabaseModal({ isOpen, onClose }: ConvexDatabaseModalProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<TabType>("movies");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Live queries to Convex Cloud Database
  const movies = useQuery(api.movies.listMovies, { limit: 100 });
  const recentRatings = useQuery(api.ratings.getRecentRatings, { limit: 50 });
  const allFeedback = useQuery(api.feedback.listFeedback, { limit: 50 });
  const experiments = useQuery(api.experiments.listExperiments);
  const users = useQuery(api.users.listUsers);
  const feedbackSummary = useQuery(api.feedback.getFeedbackSummary);

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: string; count: number | undefined }[] = [
    { id: "movies", label: "movies", icon: "🎬", count: movies?.length },
    { id: "ratings", label: "ratings", icon: "⭐", count: recentRatings?.length },
    { id: "watchlist", label: "watchlist", icon: "📌", count: undefined },
    { id: "feedback", label: "feedback", icon: "💬", count: allFeedback?.length },
    { id: "experiments", label: "experiments", icon: "🧪", count: experiments?.length },
    { id: "users", label: "users", icon: "👥", count: users?.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-[#0A0E1A] shadow-2xl overflow-hidden animate-slide-up">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-100/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Convex Cloud Database Inspector
                </h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Deployment: <span className="text-cyan-300">standing-wolverine-760.convex.cloud</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://dashboard.convex.dev"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors"
            >
              <span>Convex Dashboard</span>
              <span>↗</span>
            </a>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/5 bg-black/40 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedDoc(null);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Table / List View */}
          <div className={`${selectedDoc ? "lg:col-span-7 border-r border-white/10" : "lg:col-span-12"} overflow-y-auto p-4 flex flex-col gap-3`}>
            {activeTab === "movies" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Catalog titles stored in Convex Cloud ({movies?.length ?? 0} docs):</span>
                  <span className="font-mono text-cyan-300 text-[11px]">table: movies</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {movies?.map((m) => (
                    <div
                      key={m.movieId}
                      onClick={() => setSelectedDoc(m)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-surface-100/40 hover:border-cyan-500/40 hover:bg-surface-200/60 cursor-pointer transition-all text-xs"
                    >
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="h-12 w-8 rounded object-cover border border-white/10 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = `/posters/${m.movieId}.jpg`;
                        }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-white truncate">{m.title}</span>
                        <span className="text-[11px] text-slate-400 truncate">{m.genres.join(", ")}</span>
                        <span className="font-mono text-[10px] text-cyan-400">ID: {m.movieId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "ratings" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Real-time user ratings stored in Convex:</span>
                  <span className="font-mono text-cyan-300 text-[11px]">table: ratings</span>
                </div>
                {recentRatings && recentRatings.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {recentRatings.map((r) => (
                      <div
                        key={r._id}
                        onClick={() => setSelectedDoc(r)}
                        className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-surface-100/40 hover:border-cyan-500/40 cursor-pointer transition-all text-xs"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-white">{r.movieTitle}</span>
                          <span className="text-[11px] text-slate-400">
                            User: <strong className="text-brand-300 font-mono">{r.userId}</strong> • {new Date(r.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold font-mono">
                          <span>{r.rating}★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No ratings in table yet. Rate a movie on the home feed to see it sync here in real time!
                  </div>
                )}
              </div>
            )}

            {activeTab === "watchlist" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Bookmarked movies in user watchlist:</span>
                  <span className="font-mono text-cyan-300 text-[11px]">table: watchlist</span>
                </div>
                <div className="p-6 rounded-xl border border-dashed border-white/10 bg-white/5 text-center text-xs text-slate-400">
                  Click the bookmark ribbon button on any Movie Card to instantly add or remove titles from Convex Cloud!
                </div>
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Live Satisfaction Rate: <strong className="text-emerald-400">{feedbackSummary?.satisfactionRate ?? 100}%</strong></span>
                  <span className="font-mono text-cyan-300 text-[11px]">table: feedback</span>
                </div>
                {allFeedback?.map((f) => (
                  <div
                    key={f._id}
                    onClick={() => setSelectedDoc(f)}
                    className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/5 bg-surface-100/40 hover:border-cyan-500/40 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{f.movieTitle ?? `Movie #${f.movieId}`}</span>
                      <span className="font-mono text-[11px] text-cyan-400">{f.modelName}</span>
                    </div>
                    {f.comment && (
                      <p className="italic text-slate-300 text-[11px] bg-black/30 p-2 rounded">
                        &ldquo;{f.comment}&rdquo;
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      User: {f.userId} • {new Date(f.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "experiments" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Offline ML Benchmarks saved in Convex:</span>
                  <span className="font-mono text-cyan-300 text-[11px]">table: experiments</span>
                </div>
                {experiments?.map((exp) => (
                  <div
                    key={exp._id}
                    onClick={() => setSelectedDoc(exp)}
                    className="p-3.5 rounded-xl border border-white/5 bg-surface-100/40 hover:border-cyan-500/40 cursor-pointer transition-all text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{exp.title}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                        {exp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{exp.notes}</p>
                    <span className="font-mono text-[10px] text-brand-300">
                      Models: {exp.models.join(", ")} | K={exp.k}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "users" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Evaluator profiles registered in Convex:</span>
                  <span className="font-mono text-cyan-300 text-[11px]">table: users</span>
                </div>
                {users?.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => setSelectedDoc(u)}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-surface-100/40 hover:border-cyan-500/40 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{u.displayName}</span>
                      <span className="font-mono text-brand-300 text-[11px]">{u.userId}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Active: {new Date(u.lastActive).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document JSON Inspector Detail View */}
          {selectedDoc && (
            <div className="hidden lg:flex lg:col-span-5 p-4 flex-col gap-3 bg-black/60 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  Document JSON Inspector
                </span>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <pre className="text-[11px] font-mono text-emerald-300 bg-black/80 p-3 rounded-xl border border-white/10 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedDoc, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-surface-100/40 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Convex Real-Time WebSocket Channel Active</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any row to inspect underlying JSON document
          </span>
        </div>
      </div>
    </div>
  );
}
