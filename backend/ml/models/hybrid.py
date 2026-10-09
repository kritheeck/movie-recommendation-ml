"""Hybrid Recommender combining Collaborative and Content-Based signals."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from .base import Explanation, Recommender, ScoredItem
from .content_based import ContentBased
from .item_knn import ItemKNN
from .popularity import PopularityBaseline

if TYPE_CHECKING:
    import pandas as pd


class Hybrid(Recommender):
    """Hybrid Recommender combining Item Collaborative Filtering and Content-Based Features."""

    def __init__(self, cf_weight: float = 0.60, cb_weight: float = 0.40) -> None:
        self.cf_weight = cf_weight
        self.cb_weight = cb_weight
        self.cf_model = ItemKNN()
        self.cb_model = ContentBased()
        self.pop_model = PopularityBaseline()
        self.all_items: list[int] = []
        self.user_rated_items: dict[int, set[int]] = {}

    @property
    def name(self) -> str:
        return "Hybrid"

    def get_params(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "cf_weight": self.cf_weight,
            "cb_weight": self.cb_weight,
        }

    def set_movies_catalog(self, movies_df: pd.DataFrame) -> None:
        self.cb_model.set_movies_catalog(movies_df)

    def fit(self, train: pd.DataFrame) -> None:
        self.cf_model.fit(train)
        self.cb_model.fit(train)
        self.pop_model.fit(train)
        self.all_items = sorted(train["movieId"].unique().tolist())
        self.user_rated_items = train.groupby("userId")["movieId"].apply(set).to_dict()

    def predict(self, user_id: int, item_id: int) -> float:
        pred_cf = self.cf_model.predict(user_id, item_id)
        pred_cb = self.cb_model.predict(user_id, item_id)
        return float(self.cf_weight * pred_cf + self.cb_weight * pred_cb)

    def recommend(self, user_id: int, k: int = 10, exclude_seen: bool = True) -> list[ScoredItem]:
        seen = self.user_rated_items.get(user_id, set()) if exclude_seen else set()

        # Cold start fallback if user has no interactions
        if len(seen) == 0:
            return self.pop_model.recommend(user_id, k, exclude_seen)

        candidates = [mid for mid in self.all_items if mid not in seen]
        scored: list[tuple[int, float]] = []

        for mid in candidates:
            score = self.predict(user_id, mid)
            scored.append((mid, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [
            ScoredItem(movie_id=int(mid), score=float(round(score, 4)), rank=idx + 1)
            for idx, (mid, score) in enumerate(scored[:k])
        ]

    def explain(self, user_id: int, item_id: int) -> Explanation:
        pred_cf = self.cf_model.predict(user_id, item_id)
        pred_cb = self.cb_model.predict(user_id, item_id)
        return Explanation(
            movie_id=item_id,
            reason="Synthesizes collaborative audience patterns with item metadata similarity for balanced relevance.",
            supporting=[
                {
                    "type": "collaborative_score",
                    "weight": self.cf_weight,
                    "score": round(pred_cf, 3),
                },
                {"type": "content_score", "weight": self.cb_weight, "score": round(pred_cb, 3)},
            ],
        )
