"""User-based Collaborative Filtering using Cosine Similarity on centered rating vectors."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from .base import Explanation, Recommender, ScoredItem


class UserKNN(Recommender):
    """User-based Collaborative Filtering Recommender."""

    def __init__(self, k_neighbors: int = 20, min_common_items: int = 2) -> None:
        self.k_neighbors = k_neighbors
        self.min_common_items = min_common_items
        self.user_item_matrix: pd.DataFrame = pd.DataFrame()
        self.user_sim_matrix: np.ndarray = np.array([])
        self.user_means: pd.Series = pd.Series(dtype=float)
        self.global_mean: float = 3.5
        self.user_id_to_idx: dict[int, int] = {}
        self.idx_to_user_id: dict[int, int] = {}
        self.user_rated_items: dict[int, set[int]] = {}
        self.all_items: list[int] = []

    @property
    def name(self) -> str:
        return "UserKNN"

    def get_params(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "k_neighbors": self.k_neighbors,
            "min_common_items": self.min_common_items,
        }

    def fit(self, train: pd.DataFrame) -> None:
        self.global_mean = float(train["rating"].mean())
        self.user_rated_items = train.groupby("userId")["movieId"].apply(set).to_dict()
        self.all_items = sorted(train["movieId"].unique().tolist())

        # Pivot to dense user-item matrix
        self.user_item_matrix = train.pivot_table(
            index="userId", columns="movieId", values="rating"
        ).fillna(0.0)

        users = self.user_item_matrix.index.tolist()
        self.user_id_to_idx = {uid: idx for idx, uid in enumerate(users)}
        self.idx_to_user_id = dict(enumerate(users))

        # Center user ratings (subtract user mean over rated items)
        user_means_dict = {}
        for uid in users:
            row = self.user_item_matrix.loc[uid]
            rated_vals = row[row > 0]
            user_means_dict[uid] = (
                float(rated_vals.mean()) if len(rated_vals) > 0 else self.global_mean
            )
        self.user_means = pd.Series(user_means_dict)

        # Compute cosine similarity
        self.user_sim_matrix = cosine_similarity(self.user_item_matrix.values)
        np.fill_diagonal(self.user_sim_matrix, 0.0)

    def predict(self, user_id: int, item_id: int) -> float:
        if user_id not in self.user_id_to_idx or item_id not in self.user_item_matrix.columns:
            return float(self.user_means.get(user_id, self.global_mean))

        u_idx = self.user_id_to_idx[user_id]
        u_mean = float(self.user_means[user_id])

        # Get ratings for this item by all users
        item_ratings = self.user_item_matrix[item_id].values
        rated_mask = item_ratings > 0

        if not np.any(rated_mask):
            return u_mean

        sims = self.user_sim_matrix[u_idx, rated_mask]
        ratings = item_ratings[rated_mask]
        other_means = self.user_means.values[rated_mask]

        # Select top-k neighbors who rated the item
        if len(sims) > self.k_neighbors:
            top_k_indices = np.argsort(sims)[-self.k_neighbors :]
            sims = sims[top_k_indices]
            ratings = ratings[top_k_indices]
            other_means = other_means[top_k_indices]

        # Only consider positive similarities
        pos_mask = sims > 0
        if not np.any(pos_mask):
            return u_mean

        sims = sims[pos_mask]
        ratings = ratings[pos_mask]
        other_means = other_means[pos_mask]

        sim_sum = np.sum(np.abs(sims))
        if sim_sum == 0:
            return u_mean

        pred = u_mean + np.sum(sims * (ratings - other_means)) / sim_sum
        return float(np.clip(pred, 0.5, 5.0))

    def recommend(self, user_id: int, k: int = 10, exclude_seen: bool = True) -> list[ScoredItem]:
        seen = self.user_rated_items.get(user_id, set()) if exclude_seen else set()
        candidate_items = [i for i in self.all_items if i not in seen]

        scored: list[tuple[int, float]] = []
        for item_id in candidate_items:
            score = self.predict(user_id, item_id)
            scored.append((item_id, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [
            ScoredItem(movie_id=int(mid), score=float(round(score, 4)), rank=idx + 1)
            for idx, (mid, score) in enumerate(scored[:k])
        ]

    def explain(self, user_id: int, item_id: int) -> Explanation:
        return Explanation(
            movie_id=item_id,
            reason="Highly rated by users whose taste profiles closely match yours.",
            supporting=[
                {"type": "neighborhood_size", "k": self.k_neighbors},
                {"type": "similarity_metric", "metric": "adjusted_cosine"},
            ],
        )
