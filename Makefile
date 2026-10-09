.PHONY: setup data dev test lint experiment reproduce build up

# ── Colours ───────────────────────────────────────────────────────────────────
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RESET  := \033[0m

# ── Setup ─────────────────────────────────────────────────────────────────────
setup: ## Install all dependencies (backend + frontend)
	@echo "$(GREEN)→ Installing backend dependencies with uv$(RESET)"
	cd backend && uv sync
	@echo "$(GREEN)→ Installing frontend dependencies with pnpm$(RESET)"
	cd frontend && pnpm install
	@echo "$(GREEN)→ Copying .env.example to .env (if not exists)$(RESET)"
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@echo "$(GREEN)✓ Setup complete$(RESET)"

# ── Data ──────────────────────────────────────────────────────────────────────
data: ## Download and verify MovieLens ml-latest-small dataset
	@echo "$(GREEN)→ Downloading MovieLens dataset$(RESET)"
	cd backend && uv run python ../scripts/download_data.py
	@echo "$(GREEN)✓ Dataset ready$(RESET)"

# ── Dev ───────────────────────────────────────────────────────────────────────
dev: ## Start backend and frontend in development mode
	@echo "$(YELLOW)Starting backend on :8000 and frontend on :3000$(RESET)"
	@echo "Press Ctrl+C to stop both servers."
	make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && pnpm dev

# ── Tests ─────────────────────────────────────────────────────────────────────
test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend pytest suite
	cd backend && uv run pytest --cov=app --cov=ml --cov-report=term-missing -q

test-frontend: ## Run frontend vitest suite
	cd frontend && pnpm test

test-e2e: ## Run Playwright E2E tests (requires running dev server)
	cd frontend && pnpm test:e2e

# ── Lint ──────────────────────────────────────────────────────────────────────
lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## ruff + mypy on backend
	cd backend && uv run ruff check .
	cd backend && uv run mypy ml/ --strict

lint-frontend: ## ESLint + TypeScript on frontend
	cd frontend && pnpm lint
	cd frontend && pnpm type-check

# ── Experiment ────────────────────────────────────────────────────────────────
experiment: ## Run full experiment: train all models, compute metrics, write artifacts
	@echo "$(GREEN)→ Running experiment (Phase 3 onwards)$(RESET)"
	cd backend && uv run python -m ml.evaluation.runner

# ── Reproduce ─────────────────────────────────────────────────────────────────
reproduce: ## Reproduce a specific experiment run: make reproduce RUN=<id>
	@if [ -z "$(RUN)" ]; then echo "Usage: make reproduce RUN=<experiment-id>"; exit 1; fi
	@echo "$(GREEN)→ Reproducing experiment $(RUN)$(RESET)"
	cd backend && uv run python -m ml.evaluation.runner --reproduce $(RUN)

# ── Docker ────────────────────────────────────────────────────────────────────
build: ## Build Docker images
	docker compose build

up: ## Start all services via Docker Compose
	docker compose up

down: ## Stop all services
	docker compose down

# ── Help ──────────────────────────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
