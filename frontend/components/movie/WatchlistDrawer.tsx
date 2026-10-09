"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface WatchlistDrawerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie?: (movieId: number) => void;
}

export function WatchlistDrawer({
  userId,
  isOpen,
  onClose,
  onSelectMovie,
}: WatchlistDrawerProps): React.ReactElement | null {
  const watchlist = useQuery(api.watchlist.getWatchlist, { userId });
  const removeFromWatchlist = useMutation(api.watchlist.removeFromWatchlist);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md h-full bg-[#0A0E1A] border-l border-white/10 shadow-2xl flex flex-col p-6 animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔖</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Your Watchlist</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-emerald-400">
                  ⚡ Synced via Convex Cloud DB
                </span>
                <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.2 rounded font-mono border border-brand-500/30">
                  Real-time
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
          {watchlist === undefined ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
              <span className="animate-spin text-xl mb-2">⏳</span>
              Loading watchlist from Convex...
            </div>
          ) : watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
              <span className="text-4xl mb-3">🍿</span>
              <h3 className="text-sm font-semibold text-slate-200">Watchlist is empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Click the bookmark (🔖) icon on any movie card to instantly save it to your Convex cloud database.
              </p>
            </div>
          ) : (
            watchlist.map((item) => (
              <div
                key={item._id}
                className="group relative flex items-center justify-between p-3 rounded-xl bg-surface-100/60 border border-white/10 hover:border-brand-500/40 hover:bg-surface-200/80 transition-all"
              >
                <div
                  className="flex-1 cursor-pointer pr-2"
                  onClick={() => onSelectMovie?.(item.movieId)}
                >
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    {item.year && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.year}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {item.genres}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    Added: {new Date(item.addedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() =>
                    removeFromWatchlist({ userId, movieId: item.movieId })
                  }
                  title="Remove from Watchlist"
                  className="opacity-60 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Items: <strong className="text-white">{watchlist?.length ?? 0}</strong></span>
          <span className="text-[11px] text-brand-300">Convex Realtime Reactive</span>
        </div>
      </div>
    </div>
  );
}
