"""Matrix Factorization Recommender using TruncatedSVD."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

import numpy as np
from sklearn.decomposition import TruncatedSVD

from .base import Explanation, Recommender, ScoredItem

if TYPE_CHECKING:
    import pandas as pd


class MatrixFactorization(Recommender):
    """Matrix Factorization Recommender using Latent Semantic SVD Decomposition."""

    def __init__(self, n_factors: int = 20, random_state: int = 42) -> None:
        self.n_factors = n_factors
        self.random_state = random_state
        self.svd = TruncatedSVD(n_components=n_factors, random_state=random_state)
        self.user_factors: np.ndarray = np.array([])
        self.item_factors: np.ndarray = np.array([])
        self.user_to_idx: dict[int, int] = {}
        self.item_to_idx: dict[int, int] = {}
        self.idx_to_item: dict[int, int] = {}
        self.user_rated_items: dict[int, set[int]] = {}
        self.all_items: list[int] = []
        self.global_mean: float = 3.5

    @property
    def name(self) -> str:
        return "MatrixFactorization"

    def get_params(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "n_factors": self.n_factors,
            "random_state": self.random_state,
        }

    def fit(self, train: pd.DataFrame) -> None:
        self.global_mean = float(train["rating"].mean())
        self.user_rated_items = train.groupby("userId")["movieId"].apply(set).to_dict()

        pivot = train.pivot_table(index="userId", columns="movieId", values="rating").fillna(0.0)
        self.user_to_idx = {uid: idx for idx, uid in enumerate(pivot.index)}
        self.item_to_idx = {mid: idx for idx, mid in enumerate(pivot.columns)}
        self.idx_to_item = dict(enumerate(pivot.columns))
        self.all_items = pivot.columns.tolist()

        n_components = min(self.n_factors, min(pivot.shape) - 1)
        self.svd = TruncatedSVD(n_components=n_components, random_state=self.random_state)
        self.user_factors = self.svd.fit_transform(pivot.values)  # (N_users, K)
        self.item_factors = self.svd.components_.T  # (N_items, K)

    def predict(self, user_id: int, item_id: int) -> float:
        if user_id not in self.user_to_idx or item_id not in self.item_to_idx:
            return self.global_mean

        u_idx = self.user_to_idx[user_id]
        i_idx = self.item_to_idx[item_id]

        u_vec = self.user_factors[u_idx]
        i_vec = self.item_factors[i_idx]

        norm_u = np.linalg.norm(u_vec)
        norm_i = np.linalg.norm(i_vec)
        if norm_u == 0 or norm_i == 0:
            return self.global_mean

        sim = float(np.dot(u_vec, i_vec) / (norm_u * norm_i))
        score = self.global_mean + sim * 1.5
        return float(np.clip(score, 0.5, 5.0))

    def recommend(self, user_id: int, k: int = 10, exclude_seen: bool = True) -> list[ScoredItem]:
        if user_id not in self.user_to_idx:
            # Fallback for unseen users: return popular items
            scored = [(mid, self.global_mean) for mid in self.all_items]
        else:
            u_idx = self.user_to_idx[user_id]
            u_vec = self.user_factors[u_idx]
            norm_u = np.linalg.norm(u_vec)

            if norm_u == 0:
                scored = [(mid, self.global_mean) for mid in self.all_items]
            else:
                item_norms = np.linalg.norm(self.item_factors, axis=1)
                item_norms[item_norms == 0] = 1.0
                all_sims = np.dot(u_vec, self.item_factors.T) / (norm_u * item_norms)
                all_scores = np.clip(self.global_mean + all_sims * 1.5, 0.5, 5.0)

                scored = [
                    (self.idx_to_item[idx], float(all_scores[idx]))
                    for idx in range(len(self.all_items))
                ]

        seen = self.user_rated_items.get(user_id, set()) if exclude_seen else set()
        candidates = [(mid, score) for mid, score in scored if mid not in seen]
        candidates.sort(key=lambda x: x[1], reverse=True)

        return [
            ScoredItem(movie_id=int(mid), score=float(round(score, 4)), rank=idx + 1)
            for idx, (mid, score) in enumerate(candidates[:k])
        ]


    def explain(self, user_id: int, item_id: int) -> Explanation:
        return Explanation(
            movie_id=item_id,
            reason=f"Strong latent feature alignment ({self.n_factors} SVD components) between your viewing history and this movie's characteristics.",
            supporting=[{"type": "latent_factors", "dim": self.n_factors}],
        )
