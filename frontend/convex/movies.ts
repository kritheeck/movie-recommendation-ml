import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const seedMovies = mutation({
  args: {
    movies: v.array(
      v.object({
        movieId: v.number(),
        title: v.string(),
        genres: v.array(v.string()),
        year: v.optional(v.number()),
        posterUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    for (const m of args.movies) {
      const existing = await ctx.db
        .query("movies")
        .withIndex("by_movieId", (q) => q.eq("movieId", m.movieId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: m.title,
          genres: m.genres,
          year: m.year,
          posterUrl: m.posterUrl,
        });
        updated += 1;
      } else {
        await ctx.db.insert("movies", {
          movieId: m.movieId,
          title: m.title,
          genres: m.genres,
          year: m.year,
          posterUrl: m.posterUrl,
        });
        inserted += 1;
      }
    }
    return { inserted, updated, total: args.movies.length };
  },
});

export const listMovies = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db.query("movies").take(limit);
  },
});

export const getMovie = query({
  args: {
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .withIndex("by_movieId", (q) => q.eq("movieId", args.movieId))
      .first();
  },
});
