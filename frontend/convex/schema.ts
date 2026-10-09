import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  movies: defineTable({
    movieId: v.number(),
    title: v.string(),
    genres: v.array(v.string()),
    year: v.optional(v.number()),
    posterUrl: v.string(),
  }).index("by_movieId", ["movieId"]),

  users: defineTable({
    userId: v.string(),
    displayName: v.string(),
    avatar: v.optional(v.string()),
    favoriteGenres: v.optional(v.array(v.string())),
    createdAt: v.number(),
    lastActive: v.number(),
  }).index("by_userId", ["userId"]),


  ratings: defineTable({
    userId: v.string(),
    movieId: v.number(),
    movieTitle: v.string(),
    genres: v.optional(v.string()),
    rating: v.number(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_movie", ["movieId"])
    .index("by_user_movie", ["userId", "movieId"]),

  feedback: defineTable({
    userId: v.string(),
    modelName: v.string(),
    movieId: v.number(),
    movieTitle: v.optional(v.string()),
    thumbsUp: v.optional(v.boolean()),
    starRating: v.optional(v.number()),
    comment: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_model", ["modelName"])
    .index("by_timestamp", ["timestamp"]),

  watchlist: defineTable({
    userId: v.string(),
    movieId: v.number(),
    title: v.string(),
    genres: v.string(),
    year: v.optional(v.number()),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_movie", ["userId", "movieId"]),

  experiments: defineTable({
    experimentId: v.string(),
    title: v.string(),
    notes: v.optional(v.string()),
    status: v.string(),
    k: v.number(),
    splitStrategy: v.optional(v.string()),
    models: v.array(v.string()),
    metrics: v.optional(v.any()),
    runTimeSeconds: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_experimentId", ["experimentId"])
    .index("by_timestamp", ["timestamp"]),

  recommendationLogs: defineTable({
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
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  movieNotes: defineTable({
    userId: v.string(),
    movieId: v.number(),
    movieTitle: v.string(),
    note: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_movie", ["userId", "movieId"]),
});
