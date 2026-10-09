/**
 * Production Typed API client for Movie Recommendation System Backend.
 */

import {
  DemoUser,
  ExperimentRunListItem,
  ExperimentRunSummary,
  FeedbackSummary,
  HealthResponse,
  Movie,
  MovieListResponse,
  ModelName,
  RecommendationResponse,
  UserRating,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_PREFIX = `${BASE_URL}/api/v1`;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`API Error ${status}: ${detail}`);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_PREFIX}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      ...init,
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = (await res.json()) as { detail?: string };
        detail = body.detail ?? detail;
      } catch {
        // use fallback statusText
      }
      throw new ApiError(res.status, detail);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(503, "Cannot connect to recommendation backend service.");
  }
}

export const api = {
  // System Health
  health: (): Promise<HealthResponse> => request<HealthResponse>("/health"),

  // Movies Catalog
  getMovies: (params?: {
    q?: string;
    genre?: string;
    year?: number;
    page?: number;
    page_size?: number;
  }): Promise<MovieListResponse> => {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.genre && params.genre !== "All") query.set("genre", params.genre);
    if (params?.year) query.set("year", params.year.toString());
    if (params?.page) query.set("page", params.page.toString());
    if (params?.page_size) query.set("page_size", params.page_size.toString());
    const qs = query.toString();
    return request<MovieListResponse>(`/movies${qs ? `?${qs}` : ""}`);
  },

  getMovie: (movieId: number): Promise<Movie> => request<Movie>(`/movies/${movieId}`),

  // Users & Ratings
  createDemoUser: (displayName?: string): Promise<DemoUser> =>
    request<DemoUser>("/users", {
      method: "POST",
      body: JSON.stringify({ display_name: displayName ?? "Demo User" }),
    }),

  getUser: (userId: string): Promise<DemoUser> => request<DemoUser>(`/users/${userId}`),

  getUserRatings: (userId: string): Promise<UserRating[]> =>
    request<UserRating[]>(`/users/${userId}/ratings`),

  submitRating: (userId: string, movieId: number, rating: number): Promise<UserRating> =>
    request<UserRating>(`/users/${userId}/ratings`, {
      method: "POST",
      body: JSON.stringify({ movie_id: movieId, rating }),
    }),

  deleteRating: (userId: string, movieId: number): Promise<{ status: string }> =>
    request<{ status: string }>(`/users/${userId}/ratings/${movieId}`, {
      method: "DELETE",
    }),

  // Recommendations
  getRecommendations: (
    userId: string,
    modelName: ModelName = "Hybrid",
    k: number = 12,
  ): Promise<RecommendationResponse> =>
    request<RecommendationResponse>(
      `/recommendations?user_id=${encodeURIComponent(userId)}&model_name=${encodeURIComponent(modelName)}&k=${k}`,
    ),

  // Feedback (Online satisfaction proxy)
  submitFeedback: (
    userId: string,
    data: {
      model_name: string;
      movie_id: number;
      thumbs_up?: boolean | null;
      star_rating?: number | null;
    },
  ): Promise<{ status: string }> =>
    request<{ status: string }>(`/feedback?user_id=${encodeURIComponent(userId)}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getFeedbackSummary: (): Promise<FeedbackSummary> =>
    request<FeedbackSummary>("/feedback/summary"),

  // Experiment Lab
  listExperiments: (): Promise<ExperimentRunListItem[]> =>
    request<ExperimentRunListItem[]>("/experiments"),

  runExperiment: (config: {
    k?: number;
    seeds?: number[];
    models?: string[];
    split_strategy?: string;
    rating_threshold?: number;
  }): Promise<ExperimentRunSummary> =>
    request<ExperimentRunSummary>("/experiments/run", {
      method: "POST",
      body: JSON.stringify({
        k: config.k ?? 10,
        seeds: config.seeds ?? [42, 43, 44],
        models: config.models ?? [
          "PopularityBaseline",
          "UserKNN",
          "ItemKNN",
          "MatrixFactorization",
          "ContentBased",
          "Hybrid",
        ],
        split_strategy: config.split_strategy ?? "user_holdout",
        rating_threshold: config.rating_threshold ?? 3.5,
      }),
    }),

  getExperiment: (experimentId: string): Promise<ExperimentRunSummary> =>
    request<ExperimentRunSummary>(`/experiments/${experimentId}`),
};
