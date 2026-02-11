BACKEND_PORT ?= 8030

.PHONY: help install install-frontend install-backend install-robot dev dev-frontend dev-backend dev-backend-e2e db-up db-down db-clean up down test test-frontend test-backend test-robot isort coverage build clean fuzz-sqli fuzz-auth-sqli fuzz-xss

help:
	@echo "ToolMe — Makefile"
	@echo ""
	@echo "  install          Install frontend + backend deps"
	@echo "  install-frontend npm install in frontend/"
	@echo "  install-backend  uv sync in backend/"
	@echo "  install-robot    Install Robot Framework + Browser (Playwright) for E2E QA"
	@echo "  dev              Run frontend + backend (dev servers)"
	@echo "  dev-frontend     Run Vite dev server (http://localhost:5173)"
	@echo "  dev-backend      Run FastAPI (port $(BACKEND_PORT)); needs Postgres (make db-up)"
	@echo "  db-up            Start PostgreSQL in Docker (port 5432). Run this before make dev-backend."
	@echo "  db-clean         Stop PostgreSQL and remove data volume (fresh DB on next db-up)"
	@echo "  up               Start db + api in Docker (ports 5432, 8030)"
	@echo "  down             Stop all containers"
	@echo "  test             Run all tests (frontend + backend)"
	@echo "  test-frontend    Vitest in frontend/"
	@echo "  test-backend     Pytest in backend/ (needs Postgres: make db-up)"
	@echo "  test-robot       Robot Framework E2E (needs frontend + backend; use 'make dev-backend-e2e' to avoid 429 on signup)"
	@echo "  isort            Sort backend imports (app/ tests/)"
	@echo "  coverage         Backend pytest with coverage report"
	@echo "  build            Build frontend for production"
	@echo "  clean            Remove build artifacts and caches"
	@echo "  fuzz-sqli        Run SQLi fuzzing on /projects (dev only; needs API on $(BACKEND_PORT))"
	@echo "  fuzz-auth-sqli   Run SQLi fuzzing on auth login (email + password; needs API on $(BACKEND_PORT))"
	@echo "  fuzz-xss        Run XSS fuzzing on homepage ?q= (dev only; needs frontend on 5173)"

db-clean:
	docker compose down -v
	@echo "Postgres stopped and volume removed."
	@echo "Run 'make db-up' then 'make dev-backend' to use a fresh database."

up:
	docker compose up -d

down:
	docker compose down

install: install-frontend install-backend

install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && uv sync

dev:
	@echo "Run in two terminals:"
	@echo "  Terminal 1: make dev-backend"
	@echo "  Terminal 2: make dev-frontend"

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port $(BACKEND_PORT)

# Backend with relaxed auth rate limit for E2E (Robot) tests; use this before make test-robot
dev-backend-e2e:
	cd backend && RATE_LIMIT_AUTH=1000/minute uv run uvicorn app.main:app --reload --host 0.0.0.0 --port $(BACKEND_PORT)

test: test-frontend test-backend

test-frontend:
	cd frontend && npm run test:run

test-backend:
	cd backend && uv sync --extra dev && uv run pytest -v

install-robot:
	cd robot && uv sync && uv run rfbrowser init

test-robot:
	cd robot && uv run robot tests/

isort:
	cd backend && uv run isort app tests

coverage:
	cd backend && uv sync --extra dev && uv run pytest --cov=app --cov-report=term-missing

build:
	cd frontend && npm run build

clean:
	rm -rf frontend/dist frontend/node_modules/.vite*
	rm -rf backend/__pycache__ backend/app/__pycache__
	@echo "Done. Use 'make install' to reinstall deps."
