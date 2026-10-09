"""User repository for database interactions."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import select

from ..models.user import User

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_or_create_demo_user(
        self, user_id: str | None = None, display_name: str = "Demo User"
    ) -> User:
        if user_id:
            stmt = select(User).where(User.id == user_id)
            result = await self.session.execute(stmt)
            existing = result.scalar_one_or_none()
            if existing:
                return existing

        new_id = user_id or f"demo-{uuid.uuid4().hex[:8]}"
        user = User(id=new_id, display_name=display_name)
        self.session.add(user)
        await self.session.flush()
        return user

    async def get_user(self, user_id: str) -> User | None:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
