import React from "react";

export function Skeleton({
  className = "",
}: {
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/5 ${className}`}
      aria-hidden="true"
    />
  );
}

export function MovieCardSkeleton(): React.ReactElement {
  return (
    <div className="glass-card overflow-hidden p-3 flex flex-col gap-3">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-8 w-full mt-auto" />
    </div>
  );
}
