"""Recommendation and Explanation Pydantic schemas."""
from __future__ import annotations

from typing import Any
from pydantic import BaseModel
from .movie import Movie

class ScoredMovieItem(BaseModel):
    movie: Movie
    score: float
    rank: int
    reason: str
    supporting_evidence: list[dict[str, Any]] = []

class RecommendationResponse(BaseModel):
    user_id: str
    model_name: str
    k: int
    items: list[ScoredMovieItem]

ScoredMovieItem.model_rebuild()
RecommendationResponse.model_rebuild()
