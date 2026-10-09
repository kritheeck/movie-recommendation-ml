# Architecture Decisions

One line per decision: **Decision | Reason | Alternative considered**

| # | Decision | Reason | Alternative |
|---|---|---|---|
| D-001 | Build fresh monorepo `movie-rec/` alongside the cloned AJAX repo | The existing repo is a separate Flask/AJAX sentiment demo; mixing them would create confusion and violate separation of concerns | Extend the existing repo |
| D-002 | Use `uv` for Python dependency management | Fast, produces a lockfile, reproducible installs, modern PEP 517 support | `pip-tools` or `poetry` |
| D-003 | Use `pnpm` for frontend package management | Deterministic installs via `pnpm-lock.yaml`, disk-efficient, required by spec | `npm` or `yarn` |
| D-004 | SQLite default, Postgres-swappable via `DATABASE_URL` env var | Simplest zero-config setup for local dev and CI; SQLAlchemy async driver swap is one env-var change | Postgres by default |
| D-005 | WAL mode enabled on every SQLite connection | WAL allows concurrent readers + one writer; prevents SQLITE_BUSY on background experiment jobs | Default journal mode |
| D-006 | ML package has zero imports from `app` or `db` | Keeps ML testable in isolation; satisfies the layering requirement in §4 | Coupling ML to FastAPI |
| D-007 | Model registry instantiates a temporary instance to read `name` property | `name` is a `@property` on abstract base; no class-level constant needed | Class variable `name: str = "..."` |
| D-008 | Accuracy defined as classification accuracy at threshold 4.0 | Honest and well-defined; avoids presenting a vague metric; documented in methodology.md | Information Retrieval-style binary relevance |
| D-009 | TMDB poster key is fully optional; absent → genre-colored placeholder | App must be fully functional with no external API keys (§3.6) | Require TMDB key |
| D-010 | Experiments written to `experiments/<timestamp>_<confighash>/` on disk | Artifacts are immutable and large; DB is for relational demo-user data only | Store in DB as BLOBs |
