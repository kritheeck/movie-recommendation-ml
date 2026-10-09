import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logRecommendation = mutation({
  args: {
    userId: v.string(),
    modelName: v.string(),
    k: v.number(),
    recommendations: v.array(
      v.object({
        movieId: v.number(),
        title: v.string(),
        score: v.number(),
        genres: v.optional(v.string()),
        explanation: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("recommendationLogs", {
      userId: args.userId,
      modelName: args.modelName,
      k: args.k,
      recommendations: args.recommendations,
      timestamp: Date.now(),
    });
  },
});

export const getRecentRecommendationLogs = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    if (args.userId) {
      return await ctx.db
        .query("recommendationLogs")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db.query("recommendationLogs").order("desc").take(limit);
  },
});
