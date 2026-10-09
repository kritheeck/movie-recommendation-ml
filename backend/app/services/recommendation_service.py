"""Recommendation service generating live personalized and baseline predictions."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import pandas as pd

from app.core.config import get_settings
from app.repositories.rating_repo import RatingRepository
from app.schemas.recommendation import RecommendationResponse, ScoredMovieItem
from app.services.movie_service import movie_service
from ml.data.loader import DatasetLoader
from ml.models.registry import registry

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

    from ml.models.base import Recommender

logger = logging.getLogger("app.services.recommendation")


class RecommendationService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._fitted_models: dict[str, Recommender] = {}
        self._train_df: pd.DataFrame | None = None
        self._movies_df: pd.DataFrame | None = None

    def _ensure_models_trained(self) -> None:
        if not self._fitted_models:
            logger.info("Initializing and fitting all ML models on MovieLens dataset...")
            loader = DatasetLoader(self.settings.data_dir)
            self._movies_df = loader.load_movies()
            self._train_df = loader.load_ratings()

            for model_name in registry.list_models():
                model = registry.instantiate(model_name)
                if hasattr(model, "set_movies_catalog"):
                    model.set_movies_catalog(self._movies_df)
                model.fit(self._train_df)
                self._fitted_models[model_name] = model
            logger.info("All ML models fitted successfully.")

    async def get_recommendations(
        self,
        session: AsyncSession,
        user_id: str,
        model_name: str = "Hybrid",
        k: int = 10,
    ) -> RecommendationResponse:
        self._ensure_models_trained()

        if model_name not in self._fitted_models:
            model_name = "Hybrid"

        # Fetch live ratings for this user from SQLite database
        rating_repo = RatingRepository(session)
        user_ratings = await rating_repo.get_user_ratings(user_id)

        # Collect top positive rated movie titles for clear explainability
        user_top_titles: list[str] = []
        if user_ratings:
            high_rated = sorted(
                [r for r in user_ratings if r.rating >= 3.5],
                key=lambda x: x.rating,
                reverse=True,
            )
            for r in high_rated[:3]:
                m = movie_service.get_movie_by_id(r.movie_id)
                if m:
                    clean_title = m.title.split(" (")[0]
                    user_top_titles.append(f"{clean_title} ({r.rating:g}/5)")



        # If user has submitted real ratings in this session, synthesize custom model for user
        if user_ratings and self._train_df is not None:
            synthetic_ratings = [
                {
                    "userId": 999999,
                    "movieId": r.movie_id,
                    "rating": r.rating,
                    "timestamp": 1700000000,
                }
                for r in user_ratings
            ]
            merged_train = pd.concat(
                [self._train_df, pd.DataFrame(synthetic_ratings)], ignore_index=True
            )
            active_model = registry.instantiate(model_name)
            if hasattr(active_model, "set_movies_catalog") and self._movies_df is not None:
                active_model.set_movies_catalog(self._movies_df)
            active_model.fit(merged_train)
            recs = active_model.recommend(user_id=999999, k=k, exclude_seen=True)
            explanation_model = active_model
            query_uid = 999999
        else:
            # Convert user_id hash or integer
            numeric_uid = abs(hash(user_id)) % 600 + 1
            model = self._fitted_models[model_name]
            recs = model.recommend(user_id=numeric_uid, k=k, exclude_seen=True)
            explanation_model = model
            query_uid = numeric_uid

        scored_items: list[ScoredMovieItem] = []
        for r in recs:
            movie_obj = movie_service.get_movie_by_id(r.movie_id)
            if not movie_obj:
                continue

            explanation = explanation_model.explain(user_id=query_uid, item_id=r.movie_id)
            reason = explanation.reason

            # Replace any raw movie IDs with clean human-readable titles
            if "movie #" in reason and user_ratings:
                for ur in user_ratings:
                    if f"movie #{ur.movie_id}" in reason:
                        src_m = movie_service.get_movie_by_id(ur.movie_id)
                        if src_m:
                            clean_src = src_m.title.split(" (")[0]
                            reason = reason.replace(f"movie #{ur.movie_id}", f'"{clean_src}"')
            elif user_top_titles and model_name in ("ContentBased", "Hybrid", "MatrixFactorization", "ItemKNN"):
                titles_str = " and ".join(user_top_titles[:2])
                genre_str = ", ".join(movie_obj.genres[:2])
                if model_name == "ContentBased":
                    reason = f"Strong content alignment ({genre_str}) with your preferences for {titles_str}."
                elif model_name == "Hybrid":
                    reason = f"Top-ranked recommendation fusing collaborative audience signals with your affinity for {titles_str}."
                elif model_name == "MatrixFactorization":
                    reason = f"Latent taste space proximity matching the thematic features of {titles_str}."

            scored_items.append(
                ScoredMovieItem(
                    movie=movie_obj,
                    score=r.score,
                    rank=r.rank,
                    reason=reason,
                    supporting_evidence=explanation.supporting,
                )
            )

        return RecommendationResponse(
            user_id=user_id,
            model_name=model_name,
            k=k,
            items=scored_items[:k],
        )


recommendation_service = RecommendationService()
