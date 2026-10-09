import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addToWatchlist = mutation({
  args: {
    userId: v.string(),
    movieId: v.number(),
    title: v.string(),
    genres: v.string(),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_movie", (q) =>
        q.eq("userId", args.userId).eq("movieId", args.movieId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("watchlist", {
      userId: args.userId,
      movieId: args.movieId,
      title: args.title,
      genres: args.genres,
      year: args.year,
      addedAt: Date.now(),
    });
  },
});

export const removeFromWatchlist = mutation({
  args: {
    userId: v.string(),
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_movie", (q) =>
        q.eq("userId", args.userId).eq("movieId", args.movieId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }
    return { success: false };
  },
});

export const getWatchlist = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const isMovieWatchlisted = query({
  args: {
    userId: v.string(),
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_movie", (q) =>
        q.eq("userId", args.userId).eq("movieId", args.movieId)
      )
      .first();
    return !!existing;
  },
});
