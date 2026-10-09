"""Recommendations API router."""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, Query

from app.db.session import get_db
from app.schemas.recommendation import RecommendationResponse
from app.services.recommendation_service import recommendation_service

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=RecommendationResponse)
async def get_recommendations(
    user_id: str = Query(description="Demo User ID"),
    model_name: str = Query(default="Hybrid", description="Recommendation Algorithm"),
    k: int = Query(default=10, ge=1, le=50, description="Top-K recommendation items"),
    db: AsyncSession = Depends(get_db),
) -> RecommendationResponse:
    return await recommendation_service.get_recommendations(
        session=db,
        user_id=user_id,
        model_name=model_name,
        k=k,
    )
