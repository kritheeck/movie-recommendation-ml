"""Rating repository for database interactions."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import delete, select

from ..models.rating import Rating

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class RatingRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add_or_update_rating(self, user_id: str, movie_id: int, rating: float) -> Rating:
        stmt = select(Rating).where(Rating.user_id == user_id, Rating.movie_id == movie_id)
        result = await self.session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.rating = rating
            await self.session.flush()
            return existing

        new_rating = Rating(user_id=user_id, movie_id=movie_id, rating=rating)
        self.session.add(new_rating)
        await self.session.flush()
        return new_rating

    async def get_user_ratings(self, user_id: str) -> list[Rating]:
        stmt = select(Rating).where(Rating.user_id == user_id).order_by(Rating.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def delete_rating(self, user_id: str, movie_id: int) -> bool:
        stmt = delete(Rating).where(Rating.user_id == user_id, Rating.movie_id == movie_id)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.rowcount > 0
