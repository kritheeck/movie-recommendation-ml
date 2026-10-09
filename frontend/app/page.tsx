"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Movie,
  ModelName,
  MODEL_CONFIGS,
  ScoredMovieItem,
} from "@/lib/types";
import { PipelineVisualizer } from "@/components/ml/PipelineVisualizer";
import { ModelSelector } from "@/components/ml/ModelSelector";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieSearchDrawer } from "@/components/movie/MovieSearchDrawer";
import { RecommendationModal } from "@/components/movie/RecommendationModal";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { RatingStars } from "@/components/movie/RatingStars";
import { useMutation, useQuery } from "convex/react";
import { api as convexApi } from "@/convex/_generated/api";
import { ConvexDatabaseModal } from "@/components/layout/ConvexDatabaseModal";


// Iconic Starter Movies for Cold-Start calibration
const ONBOARDING_TITLES = [
  { id: 109487, title: "Interstellar", genre: "Sci-Fi", poster: "/posters/109487.jpg" },
  { id: 79132, title: "Inception", genre: "Sci-Fi / Thriller", poster: "/posters/79132.jpg" },
  { id: 58559, title: "The Dark Knight", genre: "Action / Crime", poster: "/posters/58559.jpg" },
  { id: 318, title: "Shawshank Redemption", genre: "Drama", poster: "/posters/318.jpg" },
  { id: 858, title: "The Godfather", genre: "Crime / Drama", poster: "/posters/858.jpg" },
  { id: 296, title: "Pulp Fiction", genre: "Crime / Thriller", poster: "/posters/296.jpg" },
  { id: 438631, title: "Dune", genre: "Sci-Fi / Adventure", poster: "/posters/438631.jpg" },
  { id: 129, title: "Spirited Away", genre: "Animation / Fantasy", poster: "/posters/129.jpg" },
];

export default function RecommendationsPage(): React.ReactElement {
  const [userId, setUserId] = useState<string>("evaluator-session-01");
  const [selectedModel, setSelectedModel] = useState<ModelName>("Hybrid");
  const [catalogMovies, setCatalogMovies] = useState<Movie[]>([]);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [recommendations, setRecommendations] = useState<ScoredMovieItem[]>([]);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ScoredMovieItem | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(true);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isConvexExplorerOpen, setIsConvexExplorerOpen] = useState<boolean>(false);

  const convexSubmitRating = useMutation(convexApi.ratings.submitRating);
  const convexLogRecommendation = useMutation(convexApi.recommendations.logRecommendation);
  const convexFeedbackSummary = useQuery(convexApi.feedback.getFeedbackSummary);
  const convexRecentRatings = useQuery(convexApi.ratings.getRecentRatings, { limit: 5 });

  // Initialize Demo User & Fetch Catalog + Initial Ratings
  useEffect(() => {
    const stored = localStorage.getItem("demo_user_id");
    const activeUid = stored ?? "evaluator-session-01";
    setUserId(activeUid);

    // Load initial catalog with rich movie selection
    api.getMovies({ page_size: 100 })
      .then((res) => setCatalogMovies(res.items))
      .catch(() => setCatalogMovies([]))
      .finally(() => setIsLoadingCatalog(false));

    // Load user ratings if any
    api.getUserRatings(activeUid)
      .then((ratings) => {
        const rMap: Record<number, number> = {};
        ratings.forEach((r) => {
          rMap[r.movie_id] = r.rating;
        });
        setUserRatings(rMap);
      })
      .catch(() => {});
  }, []);

  // Fetch recommendations whenever user, model, or ratings change
  useEffect(() => {
    if (!userId) return;
    setIsLoadingRecs(true);
    api.getRecommendations(userId, selectedModel, 12)
      .then((res) => {
        setRecommendations(res.items);
        if (res.items.length > 0) {
          convexLogRecommendation({
            userId,
            modelName: selectedModel,
            k: 12,
            recommendations: res.items.map((item) => ({
              movieId: item.movie.id,
              title: item.movie.title,
              score: item.score,
              genres: item.movie.genres.join(", "),
              explanation: item.reason,
            })),
          }).catch(() => {});
        }
      })
      .catch(() => {
        setRecommendations([]);
      })
      .finally(() => setIsLoadingRecs(false));
  }, [userId, selectedModel, userRatings, convexLogRecommendation]);

  // Rate a movie in real-time
  const handleRateMovie = async (movie: Movie, rating: number) => {
    const updated = { ...userRatings, [movie.id]: rating };
    setUserRatings(updated);
    try {
      await api.submitRating(userId, movie.id, rating);
      await convexSubmitRating({
        userId,
        movieId: movie.id,
        movieTitle: movie.title,
        genres: movie.genres.join(", "),
        rating,
      });
      const cleanTitle = movie.title.split(" (")[0];
      setFeedbackToast(`Rated "${cleanTitle}" ${rating}★ — Saved to Convex Cloud DB & ML Engine recalculated!`);
      setTimeout(() => setFeedbackToast(null), 3500);
    } catch {
      // optimistic update retained
    }
  };


  // Movie search in catalog drawer
  const handleSearchCatalog = (query: string, genre: string) => {
    setIsLoadingCatalog(true);
    api.getMovies({ q: query, genre, page_size: 100 })
      .then((res) => setCatalogMovies(res.items))
      .catch(() => setCatalogMovies([]))
      .finally(() => setIsLoadingCatalog(false));
  };

  // Calculate live taste profile genre breakdown
  const tasteBreakdown = useMemo(() => {
    const genreScores: Record<string, number> = {};
    let totalScore = 0;

    Object.entries(userRatings).forEach(([midStr, r]) => {
      const mid = parseInt(midStr, 10);
      const movie = catalogMovies.find((m) => m.id === mid);
      if (movie) {
        movie.genres.forEach((g) => {
          genreScores[g] = (genreScores[g] ?? 0) + r;
          totalScore += r;
        });
      }
    });

    if (totalScore === 0) return [];

    return Object.entries(genreScores)
      .map(([genre, score]) => ({
        genre,
        percentage: Math.round((score / totalScore) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [userRatings, catalogMovies]);

  const topPick = recommendations[0];
  const modelCfg = MODEL_CONFIGS[selectedModel];
  const ratedCount = Object.keys(userRatings).length;

  return (
    <main className="flex flex-col gap-10">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/40 bg-surface-100/95 px-5 py-3 text-xs text-emerald-300 shadow-2xl backdrop-blur-md animate-slide-up flex items-center gap-3">
          <span className="text-base animate-pulse">✨</span>
          <span className="font-medium">{feedbackToast}</span>
        </div>
      )}

      {/* Hero Showcase with Featured Top Pick / Cinematic Spotlight */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c101d] shadow-2xl">
        {topPick && (
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src={topPick.movie.backdrop_url || topPick.movie.poster_url || `/posters/${topPick.movie.id}.jpg`}
              alt="Hero Backdrop"
              className="h-full w-full object-cover filter blur-[2px] scale-105"
              onError={(e) => {
                e.currentTarget.src = `/posters/${topPick.movie.id}.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c101d] via-[#0c101d]/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c101d] via-transparent to-transparent" />
          </div>
        )}

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-mono text-brand-300">
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
                Academic ML Recommendation Architecture
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300">
                ⚡ Real-time User Calibration Active
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Hyper-Personalized Recommendation Engine &amp; Experiment Lab
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Compare <strong className="text-white">Collaborative Filtering</strong>, <strong className="text-white">TF-IDF Vector Space Analysis</strong>, and <strong className="text-white">Hybrid Ensembles</strong> against empirical popular baselines with live explainability and paired statistical tests.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#recommendation-feed"
                className="btn-primary text-sm px-6 py-3 font-semibold shadow-lg shadow-brand-500/20"
              >
                <span>🎬</span> Explore Live Recommendations
              </a>
              <Link
                href="/compare"
                className="btn-secondary text-sm px-5 py-3 font-semibold"
              >
                <span>⚖️</span> Run Blind A/B Compare
              </Link>
              <Link
                href="/lab"
                className="btn-outline text-xs px-4 py-2.5 font-medium"
              >
                <span>🧪</span> Open Experiment Lab
              </Link>
            </div>
          </div>

          {/* Featured Top Recommendation Card in Hero */}
          {topPick && (
            <div className="lg:col-span-4 glass-card p-5 rounded-2xl border border-emerald-500/30 bg-surface-100/70 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-300 border border-emerald-500/40 shadow-sm">
                  #{topPick.rank} TOP RECOMMENDATION
                </span>
                <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-brand-300 border border-brand-500/30">
                  {Math.min(99, Math.max(60, Math.round((topPick.score / 5.0) * 100)))}% MATCH
                </span>
              </div>

              <div className="flex gap-3 items-center">
                <img
                  src={topPick.movie.poster_url || `/posters/${topPick.movie.id}.jpg`}
                  alt={topPick.movie.title}
                  className="h-24 w-16 rounded-lg object-cover shadow-md border border-white/10"
                  onError={(e) => {
                    e.currentTarget.src = `/posters/${topPick.movie.id}.jpg`;
                  }}
                />
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {topPick.movie.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 my-1">
                    {topPick.movie.genres.slice(0, 2).map((g) => (
                      <span key={g} className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                        {g}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Model: <strong className="text-emerald-400">{selectedModel}</strong>
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5 italic line-clamp-2">
                &ldquo;{topPick.reason}&rdquo;
              </p>

              <button
                onClick={() => setSelectedItemForDetail(topPick)}
                className="w-full rounded-lg bg-white/10 hover:bg-white/15 py-2 text-xs font-medium text-white transition-all border border-white/20"
              >
                Inspect Explainability Proof →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Cold-Start Taste Calibration Shelf */}
      <section className="glass-card rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="text-lg font-bold text-white">
                Quick Cold-Start Taste Calibration
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rate 2–3 iconic titles to anchor your latent taste vector and instantly calibrate recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <span className="rounded-full bg-brand-500/20 px-3 py-1 border border-brand-500/30 text-brand-300">
              {ratedCount} movies rated
            </span>
          </div>
        </div>

        {/* Live Taste Breakdown Bar if user has rated movies */}
        {tasteBreakdown.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-black/30 p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                Inferred Taste Profile:
              </span>
              <span className="text-[11px] text-emerald-400">
                Live Dynamic Vector
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tasteBreakdown.map((item) => (
                <div
                  key={item.genre}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1 border border-white/10 text-xs text-slate-200"
                >
                  <span className="font-medium text-white">{item.genre}</span>
                  <span className="font-mono font-bold text-brand-300">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8-Card Quick Calibration Shelf */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-1">
          {ONBOARDING_TITLES.map((item) => {
            const currentRating = userRatings[item.id] ?? 0;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-xl border border-white/10 bg-surface-100/40 p-2.5 transition-all hover:border-brand-500/50 hover:bg-surface-200/60"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-slate-900 mb-2">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `/posters/${item.id}.jpg`;
                    }}
                  />
                  {currentRating > 0 && (
                    <div className="absolute top-1.5 right-1.5 rounded-full bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white shadow">
                      {currentRating}★
                    </div>
                  )}
                </div>

                <span className="text-xs font-semibold text-slate-200 line-clamp-1 text-center">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 text-center line-clamp-1 mb-2">
                  {item.genre}
                </span>

                <div className="mt-auto flex justify-center">
                  <RatingStars
                    initialRating={currentRating}
                    onRate={(rating) => {
                      const fullMovie = catalogMovies.find((m) => m.id === item.id) ?? {
                        id: item.id,
                        title: item.title,
                        genres: item.genre.split(" / "),
                        year: 2020,
                        poster_url: item.poster,
                      };
                      handleRateMovie(fullMovie, rating);
                    }}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Architecture Pipeline Flow */}
      <PipelineVisualizer />

      {/* Interactive Cold-Start Preference Builder & Movie Search */}
      <MovieSearchDrawer
        movies={catalogMovies}
        userRatings={userRatings}
        onRate={handleRateMovie}
        onSearch={handleSearchCatalog}
        isLoading={isLoadingCatalog}
      />

      {/* Convex Real-Time Cloud Activity & Satisfaction Bar */}
      <section className="glass-card rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-950/20 via-surface-100 to-indigo-950/20 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-inner">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Convex Cloud Database Active
              </span>
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live ratings, watchlists, and satisfaction proxy real-time synced on <span className="font-mono text-cyan-200">standing-wolverine-760.convex.cloud</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 flex items-center gap-2 shadow-sm">
            <span className="text-slate-400">Satisfaction Rate:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {convexFeedbackSummary ? `${convexFeedbackSummary.satisfactionRate}%` : "100%"}
            </span>
            <span className="text-[10px] text-slate-500">
              ({convexFeedbackSummary?.totalFeedback ?? 0} votes)
            </span>
          </div>

          <div className="rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 flex items-center gap-2 shadow-sm">
            <span className="text-slate-400">Cloud Ratings:</span>
            <span className="text-cyan-300 font-bold text-sm">
              {convexRecentRatings ? `${convexRecentRatings.length}` : "Syncing"}
            </span>
            <span className="text-[10px] text-emerald-400">● Live</span>
          </div>

          <button
            type="button"
            onClick={() => setIsConvexExplorerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-semibold shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all cursor-pointer"
          >
            <span>⚡</span>
            <span>Inspect Live Convex DB</span>
            <span className="text-[10px]">↗</span>
          </button>
        </div>
      </section>

      {/* Recommendation Results Feed */}
      <section id="recommendation-feed" className="flex flex-col gap-6 pt-2">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Live Recommendation Feed
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Top-12 predictions generated by the <strong className="text-white">{selectedModel}</strong> model for user <span className="font-mono text-brand-300">{userId}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Active Algorithm:</span>
            <span className={`px-2.5 py-1 rounded-full border ${modelCfg.badgeBg} font-bold`}>
              {selectedModel}
            </span>
          </div>
        </div>

        {/* Model Switcher Segmented Control */}
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          disabled={isLoadingRecs}
        />

        {/* Recommendations Movie Grid */}
        {isLoadingRecs ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((item) => (
              <MovieCard
                key={item.movie.id}
                movie={item.movie}
                score={item.score}
                rank={item.rank}
                reason={item.reason}
                userRating={userRatings[item.movie.id]}
                onRate={handleRateMovie}
                onClickDetail={() => setSelectedItemForDetail(item)}
                badgeColor={modelCfg.badgeBg}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3">
            <span className="text-4xl">🎬</span>
            <h3 className="text-lg font-semibold text-white">No recommendations generated yet</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Rate a few movies above to train your personalized vector profile, or select the Popularity Baseline.
            </p>
          </div>
        )}
      </section>

      {/* Deep-Dive Recommendation Modal */}
      <RecommendationModal
        item={selectedItemForDetail}
        userId={userId}
        modelName={selectedModel}
        onClose={() => setSelectedItemForDetail(null)}
      />

      {/* Live Convex Cloud Database Explorer Modal */}
      <ConvexDatabaseModal
        isOpen={isConvexExplorerOpen}
        onClose={() => setIsConvexExplorerOpen(false)}
      />
    </main>
  );
}
