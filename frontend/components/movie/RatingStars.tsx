"use client";

import React, { useEffect, useState } from "react";

interface RatingStarsProps {
  initialRating?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({
  initialRating = 0,
  onRate,
  readOnly = false,
  size = "md",
}: RatingStarsProps): React.ReactElement {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(initialRating);

  // Sync with parent prop (e.g. after user ratings load from API)
  useEffect(() => {
    setCurrentRating(initialRating);
  }, [initialRating]);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const displayRating = hoverRating !== null ? hoverRating : currentRating;

  const handleClick = (value: number) => {
    if (readOnly) return;
    setCurrentRating(value);
    onRate?.(value);
  };

  return (
    <div
      className="inline-flex items-center gap-1"
      onMouseLeave={() => !readOnly && setHoverRating(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = displayRating >= star;
        const isHalf = displayRating >= star - 0.5 && displayRating < star;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            className={`transition-transform duration-150 ${
              readOnly ? "cursor-default" : "hover:scale-125 focus:outline-none"
            }`}
            aria-label={`Rate ${star} stars out of 5`}
          >
            <svg
              className={`${starSizes[size]} transition-colors ${
                isFilled
                  ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                  : isHalf
                  ? "text-amber-400 fill-amber-400/50"
                  : "text-slate-600 fill-transparent hover:text-slate-400"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
      {currentRating > 0 && (
        <span className="text-xs font-mono font-medium text-amber-300 ml-1.5 tabular-nums">
          {currentRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
