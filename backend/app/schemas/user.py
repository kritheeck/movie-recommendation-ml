"""User and Rating Pydantic schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field



class DemoUserCreate(BaseModel):
    display_name: str = Field(default="Evaluator Demo User", max_length=128)


class DemoUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    display_name: str
    created_at: datetime


class RatingCreate(BaseModel):
    movie_id: int
    rating: float = Field(ge=0.5, le=5.0)


class UserRating(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    movie_id: int
    rating: float
    created_at: datetime


class FeedbackCreate(BaseModel):
    model_name: str
    movie_id: int
    thumbs_up: bool | None = None
    star_rating: float | None = Field(default=None, ge=1.0, le=5.0)


class FeedbackSummary(BaseModel):
    total_feedback: int
    thumbs_up_count: int
    thumbs_down_count: int
    positive_rate: float
    mean_star_rating: float | None
