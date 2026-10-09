"""Popularity-based baseline recommendation model (non-personalized)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from .base import Explanation, Recommender, ScoredItem

if TYPE_CHECKING:
    import pandas as pd


class PopularityBaseline(Recommender):
    """Recommends movies using damped / Bayesian average rating and interaction counts."""

    def __init__(self, min_ratings: int = 5, damping_factor: float = 10.0) -> None:
        self.min_ratings = min_ratings
        self.damping_factor = damping_factor
        self.global_mean: float = 3.5
        self.item_scores: dict[int, float] = {}
        self.ranked_items: list[tuple[int, float]] = []
        self.user_rated_items: dict[int, set[int]] = {}

    @property
    def name(self) -> str:
        return "PopularityBaseline"

    def get_params(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "min_ratings": self.min_ratings,
            "damping_factor": self.damping_factor,
        }

    def fit(self, train: pd.DataFrame) -> None:
        self.global_mean = float(train["rating"].mean())
        # Track seen items per user
        self.user_rated_items = train.groupby("userId")["movieId"].apply(set).to_dict()

        item_stats = train.groupby("movieId")["rating"].agg(["count", "mean"])

        # Bayesian mean: (C * global_mean + count * mean) / (C + count)
        c = self.damping_factor
        m = self.global_mean
        scores = (c * m + item_stats["count"] * item_stats["mean"]) / (c + item_stats["count"])

        self.item_scores = scores.to_dict()
        self.ranked_items = sorted(self.item_scores.items(), key=lambda x: x[1], reverse=True)

    def predict(self, user_id: int, item_id: int) -> float:
        return float(self.item_scores.get(item_id, self.global_mean))

    def recommend(self, user_id: int, k: int = 10, exclude_seen: bool = True) -> list[ScoredItem]:
        seen = self.user_rated_items.get(user_id, set()) if exclude_seen else set()
        recommendations: list[ScoredItem] = []
        rank = 1
        for item_id, score in self.ranked_items:
            if item_id in seen:
                continue
            recommendations.append(
                ScoredItem(movie_id=int(item_id), score=float(round(score, 4)), rank=rank)
            )
            rank += 1
            if len(recommendations) >= k:
                break
        return recommendations

    def explain(self, user_id: int, item_id: int) -> Explanation:
        score = self.item_scores.get(item_id, self.global_mean)
        return Explanation(
            movie_id=item_id,
            reason="Widely acclaimed movie among all users based on overall positive ratings and popularity.",
            supporting=[{"type": "global_popularity_score", "score": round(score, 2)}],
        )
