"""Users and ratings API router."""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, HTTPException

from app.db.session import get_db
from app.repositories.rating_repo import RatingRepository
from app.repositories.user_repo import UserRepository
from app.schemas.user import DemoUser, DemoUserCreate, RatingCreate, UserRating

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=DemoUser)
async def create_demo_user(
    body: DemoUserCreate | None = None,
    db: AsyncSession = Depends(get_db),
) -> DemoUser:
    display_name = body.display_name if body else "Demo User"
    repo = UserRepository(db)
    user = await repo.get_or_create_demo_user(display_name=display_name)
    return DemoUser.model_validate(user)


@router.get("/{user_id}", response_model=DemoUser)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
) -> DemoUser:
    repo = UserRepository(db)
    user = await repo.get_user(user_id)
    if not user:
        # Create on demand if not found
        user = await repo.get_or_create_demo_user(user_id=user_id)
    return DemoUser.model_validate(user)


@router.get("/{user_id}/ratings", response_model=list[UserRating])
async def get_user_ratings(
    user_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[UserRating]:
    repo = RatingRepository(db)
    ratings = await repo.get_user_ratings(user_id)
    return [UserRating.model_validate(r) for r in ratings]


@router.post("/{user_id}/ratings", response_model=UserRating)
async def submit_rating(
    user_id: str,
    body: RatingCreate,
    db: AsyncSession = Depends(get_db),
) -> UserRating:
    # Ensure user exists
    user_repo = UserRepository(db)
    await user_repo.get_or_create_demo_user(user_id=user_id)

    rating_repo = RatingRepository(db)
    rating = await rating_repo.add_or_update_rating(
        user_id=user_id,
        movie_id=body.movie_id,
        rating=body.rating,
    )
    return UserRating.model_validate(rating)


@router.delete("/{user_id}/ratings/{movie_id}")
async def delete_rating(
    user_id: str,
    movie_id: int,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    rating_repo = RatingRepository(db)
    deleted = await rating_repo.delete_rating(user_id, movie_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Rating not found")
    return {"status": "deleted"}
