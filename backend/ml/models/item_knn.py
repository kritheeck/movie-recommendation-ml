"""Item-based Collaborative Filtering using Cosine Similarity on Item interaction vectors."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from .base import Explanation, Recommender, ScoredItem


class ItemKNN(Recommender):
    """Item-based Collaborative Filtering Recommender."""

    def __init__(self, k_neighbors: int = 20) -> None:
        self.k_neighbors = k_neighbors
        self.item_user_matrix: pd.DataFrame = pd.DataFrame()
        self.item_sim_matrix: np.ndarray = np.array([])
        self.item_id_to_idx: dict[int, int] = {}
        self.idx_to_item_id: dict[int, int] = {}
        self.user_ratings: dict[int, dict[int, float]] = {}
        self.all_items: list[int] = []
        self.global_mean: float = 3.5

    @property
    def name(self) -> str:
        return "ItemKNN"

    def get_params(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "k_neighbors": self.k_neighbors,
        }

    def fit(self, train: pd.DataFrame) -> None:
        self.global_mean = float(train["rating"].mean())
        self.all_items = sorted(train["movieId"].unique().tolist())

        # Store user ratings map
        self.user_ratings = {}
        for uid, group in train.groupby("userId"):
            self.user_ratings[uid] = dict(zip(group["movieId"], group["rating"], strict=False))

        # Item-user pivot matrix (Items as rows, Users as columns)
        pivot = train.pivot_table(index="movieId", columns="userId", values="rating").fillna(0.0)
        self.item_user_matrix = pivot

        items = pivot.index.tolist()
        self.item_id_to_idx = {mid: idx for idx, mid in enumerate(items)}
        self.idx_to_item_id = dict(enumerate(items))

        # Item-item cosine similarity
        self.item_sim_matrix = cosine_similarity(pivot.values)
        np.fill_diagonal(self.item_sim_matrix, 0.0)

    def predict(self, user_id: int, item_id: int) -> float:
        if item_id not in self.item_id_to_idx or user_id not in self.user_ratings:
            return self.global_mean

        i_idx = self.item_id_to_idx[item_id]
        u_ratings = self.user_ratings[user_id]

        sim_sum = 0.0
        weighted_sum = 0.0

        # Find items rated by user that have similarity to target item
        rated_item_indices = [
            (self.item_id_to_idx[mid], rating)
            for mid, rating in u_ratings.items()
            if mid in self.item_id_to_idx
        ]

        if not rated_item_indices:
            return self.global_mean

        for other_idx, rating in rated_item_indices:
            sim = self.item_sim_matrix[i_idx, other_idx]
            if sim > 0:
                sim_sum += sim
                weighted_sum += sim * rating

        if sim_sum == 0:
            return self.global_mean

        # Shrinkage towards global mean based on total similarity weight
        pred = (weighted_sum + 0.1 * self.global_mean) / (sim_sum + 0.1)
        return float(np.clip(pred, 0.5, 5.0))

    def recommend(self, user_id: int, k: int = 10, exclude_seen: bool = True) -> list[ScoredItem]:
        seen = set(self.user_ratings.get(user_id, {}).keys()) if exclude_seen else set()
        candidates = [mid for mid in self.all_items if mid not in seen]
        u_ratings = self.user_ratings.get(user_id, {})

        scored: list[tuple[int, float, float]] = []
        for mid in candidates:
            score = self.predict(user_id, mid)
            max_sim = 0.0
            if mid in self.item_id_to_idx:
                m_idx = self.item_id_to_idx[mid]
                for r_mid, r_val in u_ratings.items():
                    if r_mid in self.item_id_to_idx and r_val >= 3.5:
                        sim = float(self.item_sim_matrix[m_idx, self.item_id_to_idx[r_mid]])
                        if sim > max_sim:
                            max_sim = sim
            scored.append((mid, score, max_sim))

        scored.sort(key=lambda x: (x[1], x[2]), reverse=True)
        return [
            ScoredItem(movie_id=int(mid), score=float(round(score, 4)), rank=idx + 1)
            for idx, (mid, score, _) in enumerate(scored[:k])
        ]

    def explain(self, user_id: int, item_id: int) -> Explanation:
        if item_id not in self.item_id_to_idx or user_id not in self.user_ratings:
            return Explanation(
                movie_id=item_id, reason="Recommended based on item-item co-occurrence."
            )

        i_idx = self.item_id_to_idx[item_id]
        u_ratings = self.user_ratings[user_id]

        # Find top similar item rated by this user
        best_sim = -1.0
        best_source_id = None
        for mid in u_ratings:
            if mid in self.item_id_to_idx:
                sim = float(self.item_sim_matrix[i_idx, self.item_id_to_idx[mid]])
                if sim > best_sim:
                    best_sim = sim
                    best_source_id = mid

        if best_source_id is not None and best_sim > 0:
            reason = f"High co-occurrence alignment with movie #{best_source_id} you rated highly (similarity: {best_sim:.2f})."
        else:
            reason = "Recommended based on overall item interaction similarity."

        return Explanation(
            movie_id=item_id,
            reason=reason,
            supporting=[
                {
                    "type": "item_similarity",
                    "top_similar_item": best_source_id,
                    "score": round(best_sim, 3),
                }
            ],
        )

