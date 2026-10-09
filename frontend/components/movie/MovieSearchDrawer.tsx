"use client";

import React, { useState } from "react";
import { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";

interface MovieSearchDrawerProps {
  movies: Movie[];
  userRatings: Record<number, number>;
  onRate: (movie: Movie, rating: number) => void;
  onSearch: (query: string, genre: string) => void;
  isLoading?: boolean;
}

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

export function MovieSearchDrawer({
  movies,
  userRatings,
  onRate,
  onSearch,
  isLoading = false,
}: MovieSearchDrawerProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [displayCount, setDisplayCount] = useState(18);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setDisplayCount(18);
    onSearch(val, selectedGenre);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setDisplayCount(18);
    onSearch(searchTerm, genre);
  };

  const ratingCount = Object.keys(userRatings).length;
  const coldStartThreshold = 5;
  const progressPercent = Math.min(100, (ratingCount / coldStartThreshold) * 100);

  const visibleMovies = movies.slice(0, displayCount);

  return (
    <div className="flex flex-col gap-5 glass-card p-5 border border-white/10 rounded-2xl">
      {/* Search Header & Cold-Start Progress */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🎬</span> Preference Builder &amp; Movie Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rate at least 5 movies to train personalized collaborative filtering models.
          </p>
        </div>

        {/* Cold Start Indicator Progress Bar */}
        <div className="flex items-center gap-3 bg-surface-200/80 border border-white/10 rounded-xl px-3.5 py-2">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Cold-Start Status</span>
              <span className={ratingCount >= 5 ? "text-emerald-400 font-bold" : "text-amber-400"}>
                {ratingCount}/5 Rated
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  ratingCount >= 5 ? "bg-emerald-400" : "bg-brand-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          {ratingCount >= 5 ? (
            <span className="text-xs font-semibold text-emerald-400">✓ Ready</span>
          ) : (
            <span className="text-[11px] text-amber-300">Rate {5 - ratingCount} more</span>
          )}
        </div>
      </div>

      {/* Search Field & Genre Pills */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by movie title (e.g. Inception, Toy Story, Interstellar, Batman)..."
            className="w-full rounded-xl border border-white/10 bg-surface-200/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:bg-surface-200 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Genre Badges Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {GENRES.map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => handleGenreSelect(g)}
                className={`rounded-lg px-3 py-1 font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-glow-sm"
                    : "bg-surface-100/80 text-slate-400 hover:text-slate-200 hover:bg-surface-50 border border-white/5"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {visibleMovies.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                userRating={userRatings[m.id]}
                onRate={onRate}
              />
            ))}
          </div>

          {movies.length > displayCount && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setDisplayCount((prev) => prev + 18)}
                className="btn-secondary text-xs px-5 py-2"
              >
                Load More Movies ({movies.length - displayCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
