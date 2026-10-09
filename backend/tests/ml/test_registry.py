"""Registry smoke test — all models register correctly."""

from __future__ import annotations


def test_all_models_registered() -> None:
    from ml.models.registry import registry

    models = registry.list_models()
    expected = {
        "PopularityBaseline",
        "UserKNN",
        "ItemKNN",
        "MatrixFactorization",
        "ContentBased",
        "Hybrid",
    }
    assert expected == set(models), f"Missing or extra models: {set(models) ^ expected}"


def test_registry_get_raises_on_unknown() -> None:
    from ml.models.registry import registry

    try:
        registry.get("NonExistentModel")
        raise AssertionError("Expected KeyError")
    except KeyError:
        pass


def test_each_model_has_stable_name() -> None:
    """name property must be a non-empty string."""
    from ml.models.registry import registry

    for name in registry.list_models():
        cls = registry.get(name)
        instance = cls()
        assert isinstance(instance.name, str) and instance.name, f"Model {cls} has empty name"
        assert instance.name == name, f"Registry key '{name}' != instance.name '{instance.name}'"
