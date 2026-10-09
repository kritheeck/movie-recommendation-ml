/**
 * Shared TypeScript types matching Pydantic schemas and UI models.
 */

export interface HealthResponse {
  status: string;
  version: string;
}

export interface Movie {
  id: number;
  title: string;
  genres: string[];
  year: number | null;
  poster_url: string | null;
  backdrop_url?: string | null;
  avg_rating?: number | null;
  rating_count?: number | null;
}


export interface MovieListResponse {
  items: Movie[];
  total: number;
  page: number;
  page_size: number;
}

export interface SupportingEvidence {
  type?: string;
  score?: number;
  metric?: string;
  k?: number;
  top_similar_item?: number;
  weight?: number;
  dim?: number;
  [key: string]: unknown;
}

export interface ScoredMovieItem {
  movie: Movie;
  score: number;
  rank: number;
  reason: string;
  supporting_evidence?: SupportingEvidence[];
}

export interface RecommendationResponse {
  user_id: string;
  model_name: ModelName;
  k: number;
  items: ScoredMovieItem[];
}

export interface DemoUser {
  id: string;
  display_name: string;
  created_at: string;
}

export interface UserRating {
  movie_id: number;
  rating: number;
  created_at: string;
}

export interface FeedbackSummary {
  total_feedback: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
  positive_rate: number;
  mean_star_rating: number | null;
}

export interface MetricDistribution {
  mean: number;
  std: number;
}

export interface SignificanceTest {
  t_stat: number;
  p_value: number;
  statistically_significant: boolean;
}

export interface ModelMetricsSummary {
  rmse: MetricDistribution;
  mae: MetricDistribution;
  precision_at_k: MetricDistribution;
  recall_at_k: MetricDistribution;
  ndcg_at_k: MetricDistribution;
  coverage: MetricDistribution;
  significance_vs_baseline?: SignificanceTest;
}

export interface ExperimentRunSummary {
  experiment_id: string;
  status: "pending" | "running" | "complete" | "failed";
  created_at: string;
  config: {
    dataset: string;
    n_movies: number;
    n_ratings: number;
    k: number;
    seeds: number[];
    split_strategy: string;
    rating_threshold: number;
    models: string[];
    elapsed_seconds: number;
  };
  models: Record<ModelName, ModelMetricsSummary>;
  raw_runs?: Record<ModelName, Record<string, number[]>>;
}

export interface ExperimentRunListItem {
  experiment_id: string;
  timestamp: string;
  dataset: string;
  k: number;
  seeds: number[];
  models: string[];
  elapsed_seconds: number;
}

export type ModelName =
  | "Hybrid"
  | "UserKNN"
  | "ItemKNN"
  | "MatrixFactorization"
  | "ContentBased"
  | "PopularityBaseline";

export interface ModelMetadata {
  id: ModelName;
  label: string;
  category: "hybrid" | "collaborative" | "content" | "baseline";
  shortDescription: string;
  description: string;
  color: string;
  badgeBg: string;
  borderColor: string;
}

export const MODEL_CONFIGS: Record<ModelName, ModelMetadata> = {
  Hybrid: {
    id: "Hybrid",
    label: "Hybrid Ensemble",
    category: "hybrid",
    shortDescription: "Combines Item CF (0.6) + Content TF-IDF (0.4)",
    description: "Fuses collaborative audience co-occurrence signals with content metadata similarities to overcome cold start while maximizing relevance.",
    color: "#10B981",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500/50",
  },
  ItemKNN: {
    id: "ItemKNN",
    label: "Item-Based CF",
    category: "collaborative",
    shortDescription: "Item-item cosine similarity on interaction vectors",
    description: "Finds items frequently co-rated positively by similar users and weights predictions by adjusted cosine similarity.",
    color: "#0284C7",
    badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    borderColor: "border-sky-500/50",
  },
  UserKNN: {
    id: "UserKNN",
    label: "User-Based CF",
    category: "collaborative",
    shortDescription: "User-user centered neighborhood similarity",
    description: "Identifies k-nearest neighbor users with correlated rating vectors and computes normalized weighted expectation scores.",
    color: "#38BDF8",
    badgeBg: "bg-sky-400/10 text-sky-300 border-sky-400/30",
    borderColor: "border-sky-400/50",
  },
  MatrixFactorization: {
    id: "MatrixFactorization",
    label: "SVD Matrix Factorization",
    category: "collaborative",
    shortDescription: "Truncated SVD Latent Factor Decomposition (k=20)",
    description: "Decomposes the sparse rating matrix into low-rank latent user and item factor matrices to capture hidden thematic preferences.",
    color: "#06B6D4",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    borderColor: "border-cyan-500/50",
  },
  ContentBased: {
    id: "ContentBased",
    label: "Content-Based Filtering",
    category: "content",
    shortDescription: "TF-IDF Genre & Metadata Cosine Vectors",
    description: "Constructs a TF-IDF vector space over movie genres and release eras, recommending items closest to the user's high-rated vector profile.",
    color: "#8B5CF6",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    borderColor: "border-purple-500/50",
  },
  PopularityBaseline: {
    id: "PopularityBaseline",
    label: "Popularity Baseline",
    category: "baseline",
    shortDescription: "Non-personalized Bayesian Damped Average",
    description: "Non-personalized benchmark calculating overall damped weighted average ratings to serve as the rigorous experimental control.",
    color: "#64748B",
    badgeBg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    borderColor: "border-slate-500/50",
  },
};
