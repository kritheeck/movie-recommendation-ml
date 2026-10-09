"""API endpoint integration tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    res = await client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_movies_endpoint(client: AsyncClient):
    res = await client.get("/api/v1/movies?page=1&page_size=5")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) <= 5


@pytest.mark.asyncio
async def test_recommendations_endpoint(client: AsyncClient):
    res = await client.get("/api/v1/recommendations?user_id=test_evaluator&model_name=Hybrid&k=5")
    assert res.status_code == 200
    data = res.json()
    assert data["model_name"] == "Hybrid"
    assert len(data["items"]) <= 5
