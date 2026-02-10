BACKEND_PORT ?= 8030

.PHONY: help install install-frontend install-backend dev dev-frontend dev-backend test test-frontend test-backend build clean

help:
	@echo "ToolMe — Makefile"
	@echo ""
	@echo "  install          Install frontend + backend deps"
	@echo "  install-frontend npm install in frontend/"
	@echo "  install-backend  uv sync in backend/"
	@echo "  dev              Run frontend + backend (dev servers)"
	@echo "  dev-frontend     Run Vite dev server (http://localhost:5173)"
	@echo "  dev-backend      Run FastAPI (port $(BACKEND_PORT)); use BACKEND_PORT=8001 if 8000 is taken"
	@echo "  test             Run all tests (frontend + backend)"
	@echo "  test-frontend    Vitest in frontend/"
	@echo "  test-backend     (add pytest when you have tests)"
	@echo "  build            Build frontend for production"
	@echo "  clean            Remove build artifacts and caches"

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

test: test-frontend

test-frontend:
	cd frontend && npm run test:run

test-backend:
	@echo "No backend tests yet."
	# cd backend && uv run pytest

build:
	cd frontend && npm run build

clean:
	rm -rf frontend/dist frontend/node_modules/.vite*
	rm -rf backend/__pycache__ backend/app/__pycache__
	@echo "Done. Use 'make install' to reinstall deps."
