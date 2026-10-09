"""Evaluation metrics: RMSE, MAE, Precision@K, Recall@K, NDCG@K, Coverage, Diversity."""

from __future__ import annotations

import math
from typing import TYPE_CHECKING

import numpy as np

if TYPE_CHECKING:
    import pandas as pd

    from ..models.base import Recommender


class MetricEvaluator:
    """Computes ranking and rating metrics on validation or test sets."""

    @staticmethod
    def compute_rmse(predictions: list[tuple[float, float]]) -> float:
        """Computes Root Mean Squared Error from (actual, predicted) pairs."""
        if not predictions:
            return 0.0
        errors = [(act - pred) ** 2 for act, pred in predictions]
        return float(math.sqrt(np.mean(errors)))

    @staticmethod
    def compute_mae(predictions: list[tuple[float, float]]) -> float:
        """Computes Mean Absolute Error from (actual, predicted) pairs."""
        if not predictions:
            return 0.0
        errors = [abs(act - pred) for act, pred in predictions]
        return float(np.mean(errors))

    @staticmethod
    def compute_ranking_metrics_for_user(
        recommended_ids: list[int],
        relevant_ids: set[int],
        k: int = 10,
    ) -> dict[str, float]:
        """Computes Precision@K, Recall@K, and NDCG@K for a single user."""
        top_k = recommended_ids[:k]
        if not top_k or not relevant_ids:
            return {"precision": 0.0, "recall": 0.0, "ndcg": 0.0}

        hits = [1 if item in relevant_ids else 0 for item in top_k]
        n_hits = sum(hits)

        precision = n_hits / k
        recall = n_hits / len(relevant_ids) if len(relevant_ids) > 0 else 0.0

        # DCG@K
        dcg = sum((hits[i] / math.log2(i + 2)) for i in range(len(hits)))
        # IDCG@K (Ideal DCG)
        ideal_hits = [1] * min(len(relevant_ids), k)
        idcg = sum((ideal_hits[i] / math.log2(i + 2)) for i in range(len(ideal_hits)))
        ndcg = (dcg / idcg) if idcg > 0 else 0.0

        return {"precision": precision, "recall": recall, "ndcg": ndcg}

    @classmethod
    def evaluate_model(
        cls,
        model: Recommender,
        test_df: pd.DataFrame,
        k: int = 10,
        relevant_threshold: float = 3.5,
        all_catalog_items: list[int] | None = None,
    ) -> dict[str, float]:
        """Full evaluation of a model on test dataset."""
        # 1. Rating prediction metrics
        rating_pairs: list[tuple[float, float]] = []
        user_test_groups = test_df.groupby("userId")

        for _, row in test_df.iterrows():
            uid = int(row["userId"])
            mid = int(row["movieId"])
            act = float(row["rating"])
            try:
                pred = model.predict(uid, mid)
                rating_pairs.append((act, pred))
            except NotImplementedError:
                pass

        rmse = cls.compute_rmse(rating_pairs) if rating_pairs else 0.0
        mae = cls.compute_mae(rating_pairs) if rating_pairs else 0.0

        # 2. Ranking metrics
        precisions: list[float] = []
        recalls: list[float] = []
        ndcgs: list[float] = []
        all_recommended_items: set[int] = set()

        for uid, group in user_test_groups:
            relevant_items = set(group[group["rating"] >= relevant_threshold]["movieId"].tolist())
            if not relevant_items:
                continue

            recs = model.recommend(user_id=uid, k=k, exclude_seen=True)
            rec_ids = [r.movie_id for r in recs]
            all_recommended_items.update(rec_ids)

            user_metrics = cls.compute_ranking_metrics_for_user(rec_ids, relevant_items, k=k)
            precisions.append(user_metrics["precision"])
            recalls.append(user_metrics["recall"])
            ndcgs.append(user_metrics["ndcg"])

        # 3. Catalog coverage
        total_catalog = (
            len(all_catalog_items) if all_catalog_items else len(test_df["movieId"].unique())
        )
        coverage = len(all_recommended_items) / total_catalog if total_catalog > 0 else 0.0

        return {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "precision_at_k": round(float(np.mean(precisions)) if precisions else 0.0, 4),
            "recall_at_k": round(float(np.mean(recalls)) if recalls else 0.0, 4),
            "ndcg_at_k": round(float(np.mean(ndcgs)) if ndcgs else 0.0, 4),
            "coverage": round(coverage, 4),
        }
