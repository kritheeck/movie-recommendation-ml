"""SQLAlchemy 2.x declarative base."""

from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared base class for all ORM models."""
