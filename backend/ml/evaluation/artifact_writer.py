"""Writes reproducible experiment artifacts to disk."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


class ArtifactWriter:
    """Saves structured experiment runs to experiments/<run_id>/."""

    @staticmethod
    def save_run(
        experiment_id: str,
        results: dict[str, Any],
        experiments_dir: str | Path = "./experiments",
    ) -> Path:
        exp_path = Path(experiments_dir) / experiment_id
        exp_path.mkdir(parents=True, exist_ok=True)

        config_file = exp_path / "config.json"
        metrics_file = exp_path / "metrics.json"

        payload_config = {
            "experiment_id": experiment_id,
            "timestamp": datetime.now(UTC).isoformat(),
            **results.get("config", {}),
        }

        payload_metrics = {
            "experiment_id": experiment_id,
            "timestamp": datetime.now(UTC).isoformat(),
            "models": results.get("models", {}),
            "raw_runs": results.get("raw_runs", {}),
        }

        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(payload_config, f, indent=2)

        with open(metrics_file, "w", encoding="utf-8") as f:
            json.dump(payload_metrics, f, indent=2)

        return exp_path
