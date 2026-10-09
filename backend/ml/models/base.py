"""Abstract Recommender interface and shared data types.

All ML code lives in this package and has zero imports from `app` or any
database layer, keeping it independently testable.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ScoredItem:
    """A single recommendation with its predicted score and rank."""

    movie_id: int
    score: float
    rank: int


@dataclass(frozen=True)
class Explanation:
    """Human-readable explanation for a recommendation."""

    movie_id: int
    reason: str  # e.g. "Because you liked Toy Story (1995)"
    # Supporting evidence (e.g. similar items, contributing features)
    supporting: list[dict[str, Any]] = field(default_factory=list)


class Recommender(ABC):
    """Abstract base class for all recommendation models.

    Contract:
    - ``fit`` is called exactly once on training data.
    - ``predict`` returns a float score (where meaningful; raises
      ``NotImplementedError`` for models that only rank).
    - ``recommend`` returns a ranked list of ``ScoredItem``.
    - ``explain`` returns a human-readable ``Explanation``.
    - ``name`` is a stable string identifier used in experiment artifacts.
    - ``get_params`` returns a dict suitable for storing in ``config.json``.

    Implementations must not import from ``app``, ``db``, or any web framework.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Stable string identifier, e.g. ``"UserKNN"``."""

    @abstractmethod
    def get_params(self) -> dict[str, Any]:
        """Return all hyperparameters as a JSON-serialisable dict."""

    @abstractmethod
    def fit(self, train: Any) -> None:
        """Train the model on the provided training data.

        Args:
            train: A ``TrainData`` object (defined in ml.data.loader).
                   Typed as ``Any`` here to avoid circular imports; subclasses
                   should annotate the concrete type.
        """

    def predict(self, user_id: int, item_id: int) -> float:
        """Predict the rating user ``user_id`` would give item ``item_id``.

        Not all models support this; override only when meaningful.
        Raises:
            NotImplementedError: if the model does not support rating prediction.
        """
        raise NotImplementedError(f"{self.name} does not support rating prediction.")

    @abstractmethod
    def recommend(
        self,
        user_id: int,
        k: int,
        exclude_seen: bool = True,
    ) -> list[ScoredItem]:
        """Return the top-k recommendations for ``user_id``.

        Args:
            user_id: The user to generate recommendations for.
            k: Number of items to return.
            exclude_seen: If True, exclude items the user has already rated.

        Returns:
            A list of ``ScoredItem`` sorted by rank ascending (rank 1 = best).
        """

    @abstractmethod
    def explain(self, user_id: int, item_id: int) -> Explanation:
        """Return a human-readable explanation for recommending ``item_id`` to ``user_id``."""
