"""Pytest configuration and shared fixtures."""

from __future__ import annotations

import pytest
from app.db.session import create_tables
from app.main import app
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(scope="function")
async def db_setup() -> None:
    """Create all tables before each test."""
    await create_tables()
    yield


@pytest.fixture(scope="function")
async def client(db_setup: None) -> AsyncClient:
    """HTTP client wired to the FastAPI test app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
