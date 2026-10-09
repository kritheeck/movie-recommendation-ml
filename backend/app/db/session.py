"""Async SQLAlchemy session factory.

Usage in FastAPI endpoints:

    async def my_endpoint(db: AsyncSession = Depends(get_db)):
        ...
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    # SQLite-specific: pool_pre_ping keeps connections alive
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


@event.listens_for(engine.sync_engine, "connect")
def _set_sqlite_pragmas(dbapi_conn: object, _connection_record: object) -> None:
    """Enable WAL mode and foreign keys for every new SQLite connection."""
    import sqlite3

    if isinstance(dbapi_conn, sqlite3.Connection):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def create_tables() -> None:
    """Create all tables (used in tests and first-run setup)."""
    import app.models  # noqa: F401
    from app.db.base import Base  # noqa: F401 — import models so they register

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
