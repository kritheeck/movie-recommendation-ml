"use client";

import React, { useState } from "react";
import { Movie } from "@/lib/types";
import { RatingStars } from "./RatingStars";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MovieCardProps {
  movie: Movie;
  userId?: string;
  userRating?: number;
  onRate?: (movie: Movie, rating: number) => void;
  onClickDetail?: (movie: Movie) => void;
  score?: number;
  rank?: number;
  reason?: string;
  badgeColor?: string;
}


// Genre color gradients for dynamic poster styling
const GENRE_GRADIENTS: Record<string, string> = {
  Action: "from-red-950 via-slate-900 to-black",
  Adventure: "from-amber-950 via-slate-900 to-black",
  Animation: "from-sky-950 via-slate-900 to-black",
  Comedy: "from-yellow-950 via-slate-900 to-black",
  Crime: "from-zinc-950 via-slate-900 to-black",
  Drama: "from-blue-950 via-slate-900 to-black",
  Fantasy: "from-purple-950 via-slate-900 to-black",
  Horror: "from-rose-950 via-slate-900 to-black",
  Mystery: "from-indigo-950 via-slate-900 to-black",
  Romance: "from-pink-950 via-slate-900 to-black",
  "Sci-Fi": "from-cyan-950 via-slate-900 to-black",
  Thriller: "from-neutral-950 via-slate-900 to-black",
};

export function MovieCard({
  movie,
  userId,
  userRating,
  onRate,
  onClickDetail,
  score,
  rank,
  reason,
  badgeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
}: MovieCardProps): React.ReactElement {
  const [currentPoster, setCurrentPoster] = useState(movie.poster_url || `/posters/${movie.id}.jpg`);
  const [imgFailed, setImgFailed] = useState(false);

  React.useEffect(() => {
    setCurrentPoster(movie.poster_url || `/posters/${movie.id}.jpg`);
    setImgFailed(false);
  }, [movie.id, movie.poster_url]);

  const activeUid =
    userId ||
    (typeof window !== "undefined"
      ? localStorage.getItem("demo_user_id") || "evaluator-session-01"
      : "evaluator-session-01");

  const isWatchlisted = useQuery(api.watchlist.isMovieWatchlisted, {
    userId: activeUid,
    movieId: movie.id,
  });
  const addToWatchlist = useMutation(api.watchlist.addToWatchlist);
  const removeFromWatchlist = useMutation(api.watchlist.removeFromWatchlist);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const genresStr = Array.isArray(movie.genres)
        ? movie.genres.join(", ")
        : typeof movie.genres === "string"
        ? movie.genres
        : "Cinema";
      if (isWatchlisted) {
        await removeFromWatchlist({ userId: activeUid, movieId: movie.id });
      } else {
        await addToWatchlist({
          userId: activeUid,
          movieId: movie.id,
          title: movie.title,
          genres: genresStr,
          year: movie.year ?? undefined,
        });
      }
    } catch (err) {
      console.error("Convex Watchlist Error:", err);
    }
  };

  const handleImageError = () => {
    if (currentPoster !== `/posters/${movie.id}.jpg`) {
      setCurrentPoster(`/posters/${movie.id}.jpg`);
    } else {
      setImgFailed(true);
    }
  };

  const primaryGenre = movie.genres?.[0] ?? "Drama";
  const gradientClass = GENRE_GRADIENTS[primaryGenre] ?? "from-slate-900 via-slate-950 to-black";

  return (
    <div className="glass-card-interactive group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-100/60 transition-all duration-200 hover:border-brand-500/40 hover:shadow-cinematic">
      {/* Rank badge for recommendations */}
      {rank !== undefined && (
        <div className="absolute top-2.5 left-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 font-mono text-xs font-bold text-white shadow-lg border border-white/20">
          #{rank}
        </div>
      )}

      {/* Match / Prediction Score Badge */}
      {score !== undefined && (
        <div
          className={`absolute top-2.5 right-2.5 z-20 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-tight backdrop-blur-md border shadow-lg ${badgeColor}`}
        >
          {Math.min(99, Math.max(60, Math.round((score / 5.0) * 100)))}% Match
        </div>
      )}

      {/* Convex Bookmark Watchlist Button */}
      <button
        type="button"
        onClick={handleToggleWatchlist}
        title={isWatchlisted ? "Saved in Convex Watchlist (click to remove)" : "Save to Convex Cloud Watchlist"}
        className={`absolute z-30 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md border shadow-lg transition-all ${
          score !== undefined ? "top-10 right-2.5" : "top-2.5 right-2.5"
        } ${
          isWatchlisted
            ? "bg-amber-400 text-black border-amber-300 shadow-[0_0_10px_#f59e0b] scale-105"
            : "bg-black/70 text-slate-300 hover:text-white border-white/20 hover:bg-black/90 hover:scale-105"
        }`}
      >
        <svg
          className="w-3.5 h-3.5 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isWatchlisted ? (
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          ) : (
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
          )}
        </svg>
      </button>

      {/* Movie Poster Aspect Container */}
      <div
        className={`relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-b ${gradientClass} cursor-pointer flex flex-col justify-end p-3`}
        onClick={() => onClickDetail?.(movie)}
      >
        {!imgFailed ? (
          <>
            <img
              src={currentPoster}
              alt={movie.title}
              loading="lazy"
              onError={handleImageError}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1523] via-black/20 to-transparent opacity-90" />
          </>
        ) : (
          /* Dynamic Cinematic Fallback Poster */
          <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-br from-surface-200 via-surface-100 to-black">
            <div className="flex items-center justify-between">
              <span className="rounded bg-brand-500/20 px-2 py-0.5 font-mono text-[10px] text-brand-300 border border-brand-500/30">
                {primaryGenre}
              </span>
              <span className="font-mono text-xs text-slate-500">
                {movie.year ?? "Film"}
              </span>
            </div>
            <div>
              <div className="text-2xl mb-1">🎬</div>
              <h4 className="font-bold text-sm text-white line-clamp-3 leading-snug">
                {movie.title}
              </h4>
            </div>
          </div>
        )}


        {/* Hover Quick View Trigger */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <span className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/30 shadow-lg">
            Inspect Why Recommended
          </span>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="flex flex-1 flex-col p-3.5 gap-2">
        <div>
          <div className="flex items-baseline justify-between gap-1">
            <h3
              onClick={() => onClickDetail?.(movie)}
              className="font-semibold text-sm text-slate-100 line-clamp-1 group-hover:text-brand-300 transition-colors cursor-pointer"
              title={movie.title}
            >
              {movie.title}
            </h3>
            {movie.year && (
              <span className="text-[11px] font-mono text-slate-500 shrink-0">
                {movie.year}
              </span>
            )}
          </div>

          {/* Genre Pills */}
          <div className="flex flex-wrap gap-1 mt-1">
            {movie.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 border border-white/5"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Model Explanation Snippet */}
        {reason && (
          <p className="text-[11px] text-slate-400 bg-black/30 rounded p-1.5 border border-white/5 line-clamp-2 italic">
            &ldquo;{reason}&rdquo;
          </p>
        )}

        {/* Interactive 5-Star User Rating */}
        <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {userRating ? "Your Rating:" : "Rate Movie:"}
          </span>
          <RatingStars
            initialRating={userRating ?? 0}
            onRate={(r) => onRate?.(movie, r)}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
