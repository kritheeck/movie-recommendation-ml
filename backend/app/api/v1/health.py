"""Health check endpoint — GET /api/v1/health"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    version: str


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health() -> HealthResponse:
    """Returns ``{"status": "ok"}`` when the service is running."""
    from app.core.config import get_settings

    settings = get_settings()
    return HealthResponse(status="ok", version=settings.project_version)
