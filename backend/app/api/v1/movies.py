"""Movies catalog API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.schemas.movie import Movie, MovieListResponse
from app.services.movie_service import movie_service

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("", response_model=MovieListResponse)
async def list_movies(
    q: str | None = Query(default=None, description="Search movie title"),
    genre: str | None = Query(default=None, description="Filter by genre"),
    year: int | None = Query(default=None, description="Filter by year"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
) -> MovieListResponse:
    return movie_service.get_movies(
        query=q,
        genre=genre,
        year=year,
        page=page,
        page_size=page_size,
    )


@router.get("/{movie_id}", response_model=Movie)
async def get_movie(movie_id: int) -> Movie:
    movie = movie_service.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie
