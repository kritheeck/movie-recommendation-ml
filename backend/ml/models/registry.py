"""Model registry for recommendation models."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from .content_based import ContentBased
from .hybrid import Hybrid
from .item_knn import ItemKNN
from .matrix_factorization import MatrixFactorization
from .popularity import PopularityBaseline
from .user_knn import UserKNN

if TYPE_CHECKING:
    from .base import Recommender


class ModelRegistry:
    """Thread-safe registry of all available recommender classes."""

    def __init__(self) -> None:
        self._registry: dict[str, type[Recommender]] = {
            "PopularityBaseline": PopularityBaseline,
            "UserKNN": UserKNN,
            "ItemKNN": ItemKNN,
            "MatrixFactorization": MatrixFactorization,
            "ContentBased": ContentBased,
            "Hybrid": Hybrid,
        }

    def register(self, cls: type[Recommender]) -> type[Recommender]:
        instance = cls()
        self._registry[instance.name] = cls
        return cls

    def get(self, name: str) -> type[Recommender]:
        if name not in self._registry:
            available = sorted(self._registry.keys())
            raise KeyError(f"Model '{name}' not found. Available: {available}")
        return self._registry[name]

    def list_models(self) -> list[str]:
        return sorted(self._registry.keys())

    def instantiate(self, name: str, **kwargs: Any) -> Recommender:
        cls = self.get(name)
        return cls(**kwargs)


registry = ModelRegistry()
