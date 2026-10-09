"""Application configuration via pydantic-settings."""

from __future__ import annotations

from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_dir(dir_name: str) -> Path:
    """Find directory either in current directory or parent directory."""
    cwd = Path.cwd()
    if (cwd / dir_name).exists():
        return cwd / dir_name
    if (cwd.parent / dir_name).exists():
        return cwd.parent / dir_name
    # Default to monorepo root path
    return Path(__file__).resolve().parent.parent.parent.parent / dir_name


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── API ───────────────────────────────────────────────────────────────────
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Movie Recommendation System"
    project_version: str = "0.1.0"

    # ── Security ──────────────────────────────────────────────────────────────
    secret_key: str = Field(default="change-me-in-production")
    cors_origins: list[str] = Field(default=["http://localhost:3000"])

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = f"sqlite+aiosqlite:///{_find_dir('data') / 'app.db'}"

    # ── Paths ─────────────────────────────────────────────────────────────────
    data_dir: Path = _find_dir("data")
    experiments_dir: Path = _find_dir("experiments")

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = "INFO"

    # ── ML / Evaluation ───────────────────────────────────────────────────────
    random_seed: int = 42
    n_eval_seeds: int = 5
    top_k: int = 10
    min_user_ratings: int = 5
    min_item_ratings: int = 1

    train_ratio: float = 0.70
    val_ratio: float = 0.10
    test_ratio: float = 0.20

    # ── TMDB (optional) ───────────────────────────────────────────────────────
    tmdb_api_key: str | None = None

    # ── Rate limiting ─────────────────────────────────────────────────────────
    rate_limit_write: str = "30/minute"


def get_settings() -> Settings:
    return _settings


_settings = Settings()
