import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitRating = mutation({
  args: {
    userId: v.string(),
    movieId: v.number(),
    movieTitle: v.string(),
    genres: v.optional(v.string()),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_user_movie", (q) =>
        q.eq("userId", args.userId).eq("movieId", args.movieId)
      )
      .first();

    const timestamp = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        movieTitle: args.movieTitle,
        genres: args.genres,
        timestamp,
      });
      return { id: existing._id, updated: true };
    }

    const id = await ctx.db.insert("ratings", {
      userId: args.userId,
      movieId: args.movieId,
      movieTitle: args.movieTitle,
      genres: args.genres,
      rating: args.rating,
      timestamp,
    });
    return { id, updated: false };
  },
});

export const getUserRatings = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const deleteRating = mutation({
  args: {
    userId: v.string(),
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ratings")
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

export const getRecentRatings = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const count = args.limit ?? 20;
    return await ctx.db.query("ratings").order("desc").take(count);
  },
});
