"""Feedback repository for tracking online user proxy signals."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import func, select

from ..models.feedback import Feedback

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class FeedbackRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def record_feedback(
        self,
        user_id: str,
        model_name: str,
        movie_id: int,
        thumbs_up: bool | None = None,
        star_rating: float | None = None,
    ) -> Feedback:
        item = Feedback(
            user_id=user_id,
            model_name=model_name,
            movie_id=movie_id,
            thumbs_up=thumbs_up,
            star_rating=star_rating,
        )
        self.session.add(item)
        await self.session.flush()
        return item

    async def get_summary(self) -> dict[str, float | int | None]:
        stmt_total = select(func.count(Feedback.id))
        total = (await self.session.execute(stmt_total)).scalar_one() or 0

        stmt_up = select(func.count(Feedback.id)).where(Feedback.thumbs_up.is_(True))
        up = (await self.session.execute(stmt_up)).scalar_one() or 0

        stmt_down = select(func.count(Feedback.id)).where(Feedback.thumbs_up.is_(False))
        down = (await self.session.execute(stmt_down)).scalar_one() or 0

        stmt_stars = select(func.avg(Feedback.star_rating)).where(Feedback.star_rating.isnot(None))
        mean_star = (await self.session.execute(stmt_stars)).scalar_one()

        pos_rate = round((up / total), 3) if total > 0 else 0.0
        return {
            "total_feedback": total,
            "thumbs_up_count": up,
            "thumbs_down_count": down,
            "positive_rate": pos_rate,
            "mean_star_rating": round(float(mean_star), 2) if mean_star is not None else None,
        }
