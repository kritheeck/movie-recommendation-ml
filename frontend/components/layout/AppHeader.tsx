"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { DemoUser } from "@/lib/types";
import { useQuery, useMutation } from "convex/react";
import { api as convexApi } from "@/convex/_generated/api";
import { WatchlistDrawer } from "@/components/movie/WatchlistDrawer";
import { ConvexDatabaseModal } from "@/components/layout/ConvexDatabaseModal";

export function AppHeader(): React.ReactElement {
  const pathname = usePathname();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isConvexModalOpen, setIsConvexModalOpen] = useState(false);

  const getOrCreateConvexUser = useMutation(convexApi.users.getOrCreateUser);
  const watchlist = useQuery(convexApi.watchlist.getWatchlist, {
    userId: demoUser?.id ?? "evaluator-session-01",
  });


  useEffect(() => {
    // Check backend health
    api.health()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));

    // Check or init local demo user
    const storedUserId = localStorage.getItem("demo_user_id");
    const storedUserName = localStorage.getItem("demo_user_name");

    if (storedUserId) {
      const u = {
        id: storedUserId,
        display_name: storedUserName ?? "Demo Evaluator",
        created_at: new Date().toISOString(),
      };
      setDemoUser(u);
      getOrCreateConvexUser({ userId: u.id, displayName: u.display_name }).catch(() => {});
    } else {
      api.createDemoUser("Demo Evaluator")
        .then((user) => {
          localStorage.setItem("demo_user_id", user.id);
          localStorage.setItem("demo_user_name", user.display_name);
          setDemoUser(user);
          getOrCreateConvexUser({ userId: user.id, displayName: user.display_name }).catch(() => {});
        })
        .catch(() => {
          // Fallback static demo user
          const fallback = { id: "evaluator-session-01", display_name: "Demo Evaluator", created_at: new Date().toISOString() };
          localStorage.setItem("demo_user_id", fallback.id);
          setDemoUser(fallback);
          getOrCreateConvexUser({ userId: fallback.id, displayName: fallback.display_name }).catch(() => {});
        });
    }
  }, [getOrCreateConvexUser]);


  const navLinks = [
    { href: "/", label: "Recommendations", badge: "Live" },
    { href: "/compare", label: "Blind Compare", badge: "A/B" },
    { href: "/lab", label: "Experiment Lab", badge: "Research" },
    { href: "/methodology", label: "Methodology", badge: "Academic" },
  ];

  const handleResetUser = async () => {
    try {
      const newUser = await api.createDemoUser(`Evaluator-${Math.floor(100 + Math.random() * 900)}`);
      localStorage.setItem("demo_user_id", newUser.id);
      localStorage.setItem("demo_user_name", newUser.display_name);
      setDemoUser(newUser);
      window.location.reload();
    } catch {
      localStorage.removeItem("demo_user_id");
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070A12]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-700 font-bold text-white shadow-glow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-tight group-hover:text-brand-300 transition-colors">
                  MovieRec
                </span>
                <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-mono uppercase text-brand-300 border border-brand-500/30">
                  ML Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Academic Research System
              </p>
            </div>
          </Link>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-brand-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Evaluator Status & Session Control */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Convex Cloud DB Status Indicator */}
          <button
            type="button"
            onClick={() => setIsConvexModalOpen(true)}
            title="Inspect Live Convex Cloud Database"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-[11px] font-mono text-cyan-300 transition-all cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.15)]"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <span className="font-semibold">Convex DB</span>
            <span className="text-[10px] text-cyan-400/80">↗</span>
          </button>

          {/* Backend Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-100/60 border border-white/5 text-[11px] font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                backendStatus === "online"
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : backendStatus === "checking"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
              }`}
            />
            <span className="text-slate-300 capitalize">
              {backendStatus === "online" ? "API Live" : backendStatus}
            </span>
          </div>

          {/* Convex Watchlist Button */}
          <button
            onClick={() => setIsWatchlistOpen(true)}
            title="Open Convex Cloud Watchlist"
            className="flex items-center gap-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg px-2.5 py-1 text-xs transition-colors"
          >
            <span>🔖</span>
            <span className="hidden sm:inline font-medium">Watchlist</span>
            <span className="rounded-full bg-brand-500/30 text-brand-200 px-1.5 py-0.2 text-[10px] font-mono font-bold">
              {watchlist?.length ?? 0}
            </span>
          </button>

          {/* User Session Pill */}
          {demoUser && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 hidden lg:inline">User:</span>
              <span className="font-mono text-brand-300 font-medium max-w-[110px] truncate">
                {demoUser.display_name}
              </span>
              <button
                onClick={handleResetUser}
                title="Reset Evaluator Profile to Cold Start"
                className="text-slate-500 hover:text-slate-200 text-[10px] underline ml-1"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Convex Watchlist Drawer */}
      <WatchlistDrawer
        userId={demoUser?.id ?? "evaluator-session-01"}
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
      />

      {/* Convex Cloud Database Inspector Modal */}
      <ConvexDatabaseModal
        isOpen={isConvexModalOpen}
        onClose={() => setIsConvexModalOpen(false)}
      />
    </header>

  );
}
