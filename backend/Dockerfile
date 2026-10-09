# ── Backend ───────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS backend-base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv==0.12.23

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM backend-base AS deps

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM backend-base AS runtime

# Non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

COPY . .

# Ensure data and experiments dirs exist with correct ownership
RUN mkdir -p data experiments && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
