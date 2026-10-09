"""Content-Based Recommender using TF-IDF feature vectors on Genres and Metadata."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .base import Explanation, Recommender, ScoredItem


class ContentBased(Recommender):
    """Content-Based Recommender using Movie Features (Genres, Year, Title)."""

    def __init__(self) -> None:
        self.tfidf = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")
        self.movie_features_matrix: np.ndarray = np.array([])
        self.movie_id_to_idx: dict[int, int] = {}
        self.idx_to_movie_id: dict[int, int] = {}
        self.movies_df: pd.DataFrame = pd.DataFrame()
        self.user_profiles: dict[int, np.ndarray] = {}
        self.user_rated_items: dict[int, set[int]] = {}
        self.all_items: list[int] = []

    @property
    def name(self) -> str:
        return "ContentBased"

    def get_params(self) -> dict[str, Any]:
        return {"name": self.name}

    def set_movies_catalog(self, movies_df: pd.DataFrame) -> None:
        """Sets movie metadata dataframe for TF-IDF feature matrix creation."""
        self.movies_df = movies_df.copy()
        features = self.movies_df["genres"].str.replace("|", " ", regex=False)
        self.movie_features_matrix = self.tfidf.fit_transform(features).toarray()

        ids = self.movies_df["movieId"].tolist()
        self.movie_id_to_idx = {mid: idx for idx, mid in enumerate(ids)}
        self.idx_to_movie_id = dict(enumerate(ids))
        self.all_items = ids

    def fit(self, train: pd.DataFrame) -> None:
        if self.movies_df.empty:
            # Fallback: create mock features from item IDs if movies catalog not pre-loaded
            unique_items = train["movieId"].unique().tolist()
            self.all_items = unique_items
            self.movie_id_to_idx = {mid: idx for idx, mid in enumerate(unique_items)}
            self.idx_to_movie_id = dict(enumerate(unique_items))
            self.movie_features_matrix = np.eye(len(unique_items))

        self.user_rated_items = train.groupby("userId")["movieId"].apply(set).to_dict()

        # Build weighted user profile vectors: sum(rating_i * item_feature_vec_i)
        self.user_profiles = {}
        for uid, group in train.groupby("userId"):
            user_vec = np.zeros(self.movie_features_matrix.shape[1])
            total_weight = 0.0
            for _, row in group.iterrows():
                mid = int(row["movieId"])
                rating = float(row["rating"])
                if mid in self.movie_id_to_idx:
                    idx = self.movie_id_to_idx[mid]
                    # Weight by normalized rating centered around 3.0
                    weight = rating - 2.5
                    user_vec += weight * self.movie_features_matrix[idx]
                    total_weight += abs(weight)

            if total_weight > 0:
                user_vec /= total_weight
            self.user_profiles[uid] = user_vec

    def predict(self, user_id: int, item_id: int) -> float:
        if user_id not in self.user_profiles or item_id not in self.movie_id_to_idx:
            return 3.0

        u_vec = self.user_profiles[user_id]
        i_idx = self.movie_id_to_idx[item_id]
        i_vec = self.movie_features_matrix[i_idx]

        norm_u = np.linalg.norm(u_vec)
        norm_i = np.linalg.norm(i_vec)
        if norm_u == 0 or norm_i == 0:
            return 3.0

        sim = float(np.dot(u_vec, i_vec) / (norm_u * norm_i))
        # Map cosine similarity [-1, 1] to rating scale [1.0, 5.0]
        score = 3.0 + sim * 2.0
        return float(np.clip(score, 0.5, 5.0))

    def recommend(self, user_id: int, k: int = 10, exclude_seen: bool = True) -> list[ScoredItem]:
        if user_id not in self.user_profiles:
            # Cold-start user
            return [
                ScoredItem(movie_id=mid, score=3.5, rank=idx + 1)
                for idx, mid in enumerate(self.all_items[:k])
            ]

        u_vec = self.user_profiles[user_id]
        norm_u = np.linalg.norm(u_vec)

        if norm_u == 0:
            sims = np.zeros(len(self.all_items))
        else:
            sims = cosine_similarity(u_vec.reshape(1, -1), self.movie_features_matrix)[0]

        seen = self.user_rated_items.get(user_id, set()) if exclude_seen else set()
        candidates = [
            (self.idx_to_movie_id[idx], float(sims[idx]))
            for idx in range(len(self.all_items))
            if self.idx_to_movie_id[idx] not in seen
        ]
        candidates.sort(key=lambda x: x[1], reverse=True)

        return [
            ScoredItem(movie_id=int(mid), score=float(round(3.0 + score * 2.0, 4)), rank=idx + 1)
            for idx, (mid, score) in enumerate(candidates[:k])
        ]

    def explain(self, user_id: int, item_id: int) -> Explanation:
        genres_str = "matching themes and genre preferences"
        if not self.movies_df.empty and item_id in self.movie_id_to_idx:
            movie_row = self.movies_df[self.movies_df["movieId"] == item_id]
            if not movie_row.empty:
                genres = movie_row.iloc[0].get("genres", "")
                genres_str = f"shared genres: {genres.replace('|', ', ')}"

        return Explanation(
            movie_id=item_id,
            reason=f"Recommended because of content similarity ({genres_str}) aligned with your top-rated movies.",
            supporting=[{"type": "content_profile_match", "metric": "tfidf_cosine_similarity"}],
        )
