"""Movie Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class Movie(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    genres: list[str]
    year: int | None = None
    poster_url: str | None = None
    backdrop_url: str | None = None
    avg_rating: float | None = None
    rating_count: int | None = None



class MovieListResponse(BaseModel):
    items: list[Movie]
    total: int
    page: int
    page_size: int
