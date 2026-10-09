"""User satisfaction online feedback API router."""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends

from app.db.session import get_db
from app.repositories.feedback_repo import FeedbackRepository
from app.repositories.user_repo import UserRepository
from app.schemas.user import FeedbackCreate, FeedbackSummary

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=dict[str, str])
async def submit_feedback(
    user_id: str,
    body: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    user_repo = UserRepository(db)
    await user_repo.get_or_create_demo_user(user_id=user_id)

    feedback_repo = FeedbackRepository(db)
    await feedback_repo.record_feedback(
        user_id=user_id,
        model_name=body.model_name,
        movie_id=body.movie_id,
        thumbs_up=body.thumbs_up,
        star_rating=body.star_rating,
    )
    return {"status": "recorded"}


@router.get("/summary", response_model=FeedbackSummary)
async def get_feedback_summary(
    db: AsyncSession = Depends(get_db),
) -> FeedbackSummary:
    repo = FeedbackRepository(db)
    res = await repo.get_summary()
    return FeedbackSummary(
        total_feedback=int(res["total_feedback"]),
        thumbs_up_count=int(res["thumbs_up_count"]),
        thumbs_down_count=int(res["thumbs_down_count"]),
        positive_rate=float(res["positive_rate"]),
        mean_star_rating=res["mean_star_rating"],
    )
