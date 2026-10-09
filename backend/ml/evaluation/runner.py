"""Multi-seed experiment runner executing models and computing mean ± std metrics."""

from __future__ import annotations

import logging
import time
from typing import TYPE_CHECKING, Any

import numpy as np

from ..data.loader import DatasetLoader
from ..data.preprocessor import Preprocessor
from ..data.splitter import DatasetSplitter
from ..data.validator import DatasetValidator
from ..models.registry import registry
from .metrics import MetricEvaluator
from .significance import SignificanceTester

if TYPE_CHECKING:
    from ..models.base import Recommender

logger = logging.getLogger("ml.evaluation.runner")


class ExperimentRunner:
    """Executes controlled multi-seed benchmark experiments across recommendation models."""

    def __init__(
        self,
        data_dir: str = "./data",
        models: list[str] | None = None,
        k: int = 10,
        seeds: list[int] | None = None,
        test_ratio: float = 0.20,
        val_ratio: float = 0.10,
        split_strategy: str = "user_holdout",
        rating_threshold: float = 3.5,
    ) -> None:
        self.data_dir = data_dir
        self.models_to_run = models or [
            "PopularityBaseline",
            "UserKNN",
            "ItemKNN",
            "MatrixFactorization",
            "ContentBased",
            "Hybrid",
        ]
        self.k = k
        self.seeds = seeds or [42, 43, 44]
        self.test_ratio = test_ratio
        self.val_ratio = val_ratio
        self.split_strategy = split_strategy
        self.rating_threshold = rating_threshold

    def run(self) -> dict[str, Any]:
        start_time = time.time()
        loader = DatasetLoader(self.data_dir)
        movies_df = loader.load_movies()
        ratings_df = loader.load_ratings()

        DatasetValidator.validate_movies(movies_df)
        DatasetValidator.validate_ratings(ratings_df)

        all_catalog_items = movies_df["movieId"].unique().tolist()

        # Storage for seed-level metrics per model: model_name -> metric_name -> list[values]
        raw_results: dict[str, dict[str, list[float]]] = {
            m: {
                "rmse": [],
                "mae": [],
                "precision_at_k": [],
                "recall_at_k": [],
                "ndcg_at_k": [],
                "coverage": [],
            }
            for m in self.models_to_run
        }

        for seed in self.seeds:
            logger.info("Executing experiment for random seed %d ...", seed)
            train, val, test = DatasetSplitter.train_test_split(
                ratings_df,
                test_ratio=self.test_ratio,
                val_ratio=self.val_ratio,
                strategy=self.split_strategy,
                random_seed=seed,
            )
            DatasetValidator.assert_no_data_leakage(train, test)

            preprocessor = Preprocessor()
            train_filtered = preprocessor.filter_ratings(train)

            for model_name in self.models_to_run:
                model: Recommender = registry.instantiate(model_name)
                # Pass movie catalog for ContentBased/Hybrid
                if hasattr(model, "set_movies_catalog"):
                    model.set_movies_catalog(movies_df)

                model.fit(train_filtered)

                metrics = MetricEvaluator.evaluate_model(
                    model=model,
                    test_df=test,
                    k=self.k,
                    relevant_threshold=self.rating_threshold,
                    all_catalog_items=all_catalog_items,
                )

                for k_metric, val_score in metrics.items():
                    raw_results[model_name][k_metric].append(val_score)

        # Aggregate mean ± std
        aggregated_models: dict[str, Any] = {}
        baseline_ndcg = raw_results.get("PopularityBaseline", {}).get("ndcg_at_k", [])

        for model_name, metrics_dict in raw_results.items():
            aggregated_models[model_name] = {}
            for metric_name, values in metrics_dict.items():
                mean_val = float(np.mean(values))
                std_val = float(np.std(values))
                aggregated_models[model_name][metric_name] = {
                    "mean": round(mean_val, 4),
                    "std": round(std_val, 4),
                }

            # Statistical significance vs PopularityBaseline
            model_ndcg = metrics_dict.get("ndcg_at_k", [])
            sig_test = SignificanceTester.paired_t_test(baseline_ndcg, model_ndcg)
            aggregated_models[model_name]["significance_vs_baseline"] = sig_test

        elapsed = time.time() - start_time
        return {
            "config": {
                "dataset": "MovieLens-100k",
                "n_movies": len(movies_df),
                "n_ratings": len(ratings_df),
                "k": self.k,
                "seeds": self.seeds,
                "split_strategy": self.split_strategy,
                "rating_threshold": self.rating_threshold,
                "models": self.models_to_run,
                "elapsed_seconds": round(elapsed, 2),
            },
            "models": aggregated_models,
            "raw_runs": raw_results,
        }
