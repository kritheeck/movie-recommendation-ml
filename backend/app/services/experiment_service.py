"""Experiment service for running experiments and loading artifacts from disk."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from app.core.config import get_settings
from app.schemas.experiment import ExperimentRunRequest, ExperimentRunSummary
from ml.evaluation.artifact_writer import ArtifactWriter
from ml.evaluation.runner import ExperimentRunner

logger = logging.getLogger("app.services.experiment")


class ExperimentService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def run_experiment(self, req: ExperimentRunRequest) -> ExperimentRunSummary:
        exp_id = f"exp_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        logger.info("Starting controlled benchmark experiment ID: %s", exp_id)

        runner = ExperimentRunner(
            data_dir=str(self.settings.data_dir),
            models=req.models,
            k=req.k,
            seeds=req.seeds,
            split_strategy=req.split_strategy,
            rating_threshold=req.rating_threshold,
        )
        results = runner.run()

        # Save artifacts to disk
        ArtifactWriter.save_run(
            experiment_id=exp_id,
            results=results,
            experiments_dir=self.settings.experiments_dir,
        )

        return ExperimentRunSummary(
            experiment_id=exp_id,
            status="complete",
            created_at=datetime.now(UTC).isoformat(),
            config=results["config"],
            models=results["models"],
            raw_runs=results["raw_runs"],
        )

    def get_experiment_by_id(self, experiment_id: str) -> ExperimentRunSummary | None:
        exp_dir = self.settings.experiments_dir / experiment_id
        config_file = exp_dir / "config.json"
        metrics_file = exp_dir / "metrics.json"

        if not config_file.exists() or not metrics_file.exists():
            return None

        with open(config_file, encoding="utf-8") as f:
            config_data = json.load(f)

        with open(metrics_file, encoding="utf-8") as f:
            metrics_data = json.load(f)

        return ExperimentRunSummary(
            experiment_id=experiment_id,
            status="complete",
            created_at=config_data.get("timestamp", ""),
            config=config_data,
            models=metrics_data.get("models", {}),
            raw_runs=metrics_data.get("raw_runs", {}),
        )

    def list_experiments(self) -> list[dict[str, Any]]:
        self.settings.experiments_dir.mkdir(parents=True, exist_ok=True)
        runs: list[dict[str, Any]] = []

        for p in sorted(self.settings.experiments_dir.iterdir(), reverse=True):
            if p.is_dir() and (p / "config.json").exists() and (p / "metrics.json").exists():
                try:
                    with open(p / "config.json", encoding="utf-8") as f:
                        cfg = json.load(f)
                    with open(p / "metrics.json", encoding="utf-8") as f:
                        mtr = json.load(f)
                    runs.append(
                        {
                            "experiment_id": p.name,
                            "timestamp": cfg.get("timestamp", ""),
                            "dataset": cfg.get("dataset", "MovieLens-100k"),
                            "k": cfg.get("k", 10),
                            "seeds": cfg.get("seeds", []),
                            "models": list(mtr.get("models", {}).keys()),
                            "elapsed_seconds": cfg.get("elapsed_seconds", 0),
                        }
                    )
                except Exception as exc:
                    logger.warning("Could not parse experiment artifact %s: %s", p.name, exc)

        return runs


experiment_service = ExperimentService()
