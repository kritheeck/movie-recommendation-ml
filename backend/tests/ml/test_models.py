"""Unit tests for all 6 recommendation algorithms."""

from typing import TYPE_CHECKING

import pandas as pd
import pytest

from ml.models.registry import registry

if TYPE_CHECKING:
    from ml.models.base import Recommender


@pytest.fixture
def sample_train_data():
    ratings = [
        {"userId": 1, "movieId": 1, "rating": 5.0, "timestamp": 100},
        {"userId": 1, "movieId": 2, "rating": 4.0, "timestamp": 101},
        {"userId": 1, "movieId": 3, "rating": 2.0, "timestamp": 102},
        {"userId": 2, "movieId": 1, "rating": 4.5, "timestamp": 103},
        {"userId": 2, "movieId": 2, "rating": 5.0, "timestamp": 104},
        {"userId": 3, "movieId": 3, "rating": 4.0, "timestamp": 105},
        {"userId": 3, "movieId": 4, "rating": 5.0, "timestamp": 106},
    ]
    movies = pd.DataFrame(
        [
            {"movieId": 1, "title": "Toy Story (1995)", "genres": "Animation|Children"},
            {"movieId": 2, "title": "Jumanji (1995)", "genres": "Adventure|Children"},
            {"movieId": 3, "title": "Heat (1995)", "genres": "Action|Crime"},
            {"movieId": 4, "title": "GoldenEye (1995)", "genres": "Action|Adventure"},
        ]
    )
    return pd.DataFrame(ratings), movies


@pytest.mark.parametrize(
    "model_name",
    [
        "PopularityBaseline",
        "UserKNN",
        "ItemKNN",
        "MatrixFactorization",
        "ContentBased",
        "Hybrid",
    ],
)
def test_all_models_fit_and_recommend(model_name, sample_train_data):
    ratings_df, movies_df = sample_train_data
    model: Recommender = registry.instantiate(model_name)
    if hasattr(model, "set_movies_catalog"):
        model.set_movies_catalog(movies_df)

    model.fit(ratings_df)
    recs = model.recommend(user_id=1, k=2, exclude_seen=False)
    assert len(recs) <= 2
    assert all(r.rank in [1, 2] for r in recs)

    explanation = model.explain(user_id=1, item_id=recs[0].movie_id)
    assert explanation.reason
