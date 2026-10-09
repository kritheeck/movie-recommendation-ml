"""Experiment execution and metrics Pydantic schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ExperimentRunRequest(BaseModel):
    k: int = Field(default=10, ge=1, le=50)
    seeds: list[int] = Field(default=[42, 43, 44])
    models: list[str] | None = None
    split_strategy: str = "user_holdout"
    rating_threshold: float = Field(default=3.5, ge=0.5, le=5.0)


class ExperimentRunSummary(BaseModel):
    experiment_id: str
    status: str
    created_at: str
    config: dict[str, Any]
    models: dict[str, Any]
    raw_runs: dict[str, Any]
