import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: {
    userId: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastActive: now,
        displayName: args.displayName || existing.displayName,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      userId: args.userId,
      displayName: args.displayName,
      createdAt: now,
      lastActive: now,
      favoriteGenres: [],
    });
  },
});

export const getUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(20);
  },
});

export const updateFavoriteGenres = mutation({
  args: {
    userId: v.string(),
    favoriteGenres: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        favoriteGenres: args.favoriteGenres,
        lastActive: Date.now(),
      });
      return user._id;
    }
    return null;
  },
});
