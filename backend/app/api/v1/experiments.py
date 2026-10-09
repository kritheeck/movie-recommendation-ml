"""Experiments API router."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from app.schemas.experiment import ExperimentRunRequest, ExperimentRunSummary
from app.services.experiment_service import experiment_service

router = APIRouter(prefix="/experiments", tags=["experiments"])


@router.get("", response_model=list[dict[str, Any]])
async def list_experiments() -> list[dict[str, Any]]:
    return experiment_service.list_experiments()


@router.post("/run", response_model=ExperimentRunSummary)
async def run_experiment(req: ExperimentRunRequest) -> ExperimentRunSummary:
    return experiment_service.run_experiment(req)


@router.get("/{experiment_id}", response_model=ExperimentRunSummary)
async def get_experiment(experiment_id: str) -> ExperimentRunSummary:
    res = experiment_service.get_experiment_by_id(experiment_id)
    if not res:
        raise HTTPException(status_code=404, detail="Experiment artifact not found")
    return res
