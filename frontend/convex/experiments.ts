import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveExperiment = mutation({
  args: {
    experimentId: v.string(),
    title: v.string(),
    notes: v.optional(v.string()),
    status: v.string(),
    k: v.number(),
    splitStrategy: v.optional(v.string()),
    models: v.array(v.string()),
    metrics: v.optional(v.any()),
    runTimeSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("experiments")
      .withIndex("by_experimentId", (q) => q.eq("experimentId", args.experimentId))
      .first();

    const timestamp = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        notes: args.notes,
        status: args.status,
        metrics: args.metrics,
        runTimeSeconds: args.runTimeSeconds,
      });
      return existing._id;
    }

    return await ctx.db.insert("experiments", {
      experimentId: args.experimentId,
      title: args.title,
      notes: args.notes,
      status: args.status,
      k: args.k,
      splitStrategy: args.splitStrategy,
      models: args.models,
      metrics: args.metrics,
      runTimeSeconds: args.runTimeSeconds,
      timestamp,
    });
  },
});

export const listExperiments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("experiments").order("desc").collect();
  },
});

export const getExperiment = query({
  args: {
    experimentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("experiments")
      .withIndex("by_experimentId", (q) => q.eq("experimentId", args.experimentId))
      .first();
  },
});
