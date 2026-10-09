import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitFeedback = mutation({
  args: {
    userId: v.string(),
    modelName: v.string(),
    movieId: v.number(),
    movieTitle: v.optional(v.string()),
    thumbsUp: v.optional(v.boolean()),
    starRating: v.optional(v.number()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const id = await ctx.db.insert("feedback", {
      userId: args.userId,
      modelName: args.modelName,
      movieId: args.movieId,
      movieTitle: args.movieTitle,
      thumbsUp: args.thumbsUp,
      starRating: args.starRating,
      comment: args.comment,
      timestamp,
    });
    return id;
  },
});

export const getFeedbackSummary = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("feedback").collect();

    const byModel: Record<
      string,
      {
        total: number;
        thumbsUp: number;
        thumbsDown: number;
        starRatings: number[];
        avgStar: number;
      }
    > = {};

    let totalThumbsUp = 0;
    let totalThumbsDown = 0;

    for (const f of all) {
      if (!byModel[f.modelName]) {
        byModel[f.modelName] = {
          total: 0,
          thumbsUp: 0,
          thumbsDown: 0,
          starRatings: [],
          avgStar: 0,
        };
      }
      const m = byModel[f.modelName];
      m.total += 1;
      if (f.thumbsUp === true) {
        m.thumbsUp += 1;
        totalThumbsUp += 1;
      } else if (f.thumbsUp === false) {
        m.thumbsDown += 1;
        totalThumbsDown += 1;
      }
      if (typeof f.starRating === "number") {
        m.starRatings.push(f.starRating);
      }
    }

    for (const model of Object.keys(byModel)) {
      const stars = byModel[model].starRatings;
      byModel[model].avgStar =
        stars.length > 0 ? stars.reduce((a, b) => a + b, 0) / stars.length : 0;
    }

    const totalRatings = totalThumbsUp + totalThumbsDown;
    const satisfactionRate =
      totalRatings > 0 ? (totalThumbsUp / totalRatings) * 100 : 0;

    return {
      totalFeedback: all.length,
      satisfactionRate: Math.round(satisfactionRate * 10) / 10,
      totalThumbsUp,
      totalThumbsDown,
      byModel,
      recent: all.slice(-10).reverse(),
    };
  },
});

export const listFeedback = query({
  args: {
    modelName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.modelName) {
      return await ctx.db
        .query("feedback")
        .withIndex("by_model", (q) => q.eq("modelName", args.modelName!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db.query("feedback").order("desc").take(limit);
  },
});
