"""FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import experiments, feedback, health, movies, recommendations, users
from app.core.config import get_settings
from app.core.logging import RequestIdMiddleware, configure_logging
from app.db.session import create_tables

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup / shutdown logic."""
    configure_logging(settings.log_level)
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.experiments_dir.mkdir(parents=True, exist_ok=True)
    # Ensure SQLite tables exist
    await create_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version=settings.project_version,
        description=(
            "Movie Recommendation System + Experiment Lab API. "
            "All metrics shown in the UI are computed from experiment artifacts — "
            "no values are fabricated or hard-coded."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware ────────────────────────────────────────────────────────────
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Security headers ──────────────────────────────────────────────────────
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next: object) -> JSONResponse:
        from fastapi.responses import Response

        response: Response = await call_next(request)  # type: ignore[operator]
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response  # type: ignore[return-value]

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(health.router, prefix=settings.api_v1_prefix)
    app.include_router(movies.router, prefix=settings.api_v1_prefix)
    app.include_router(users.router, prefix=settings.api_v1_prefix)
    app.include_router(recommendations.router, prefix=settings.api_v1_prefix)
    app.include_router(experiments.router, prefix=settings.api_v1_prefix)
    app.include_router(feedback.router, prefix=settings.api_v1_prefix)

    # ── Global error handler ──────────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        import traceback

        from app.core.logging import get_logger

        log = get_logger("app.error")
        log.error("Unhandled exception: %s\n%s", exc, traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "type": "internal_error"},
        )

    return app


app = create_app()
