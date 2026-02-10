# ToolMe API

FastAPI backend with PostgreSQL.

## Run with Docker (recommended)

From the repo root:

```bash
docker compose up -d
```

Starts **db** (PostgreSQL on 5432) and **api** (FastAPI on 8030). Tables and seed data are created on first startup.

- **API**: http://localhost:8030/docs
- **Health**: http://localhost:8030/health

Stop: `docker compose down` (or `make down`).

## Run locally (API only)

1. **Start PostgreSQL**: `docker compose up -d db` (or `make db-up`).
2. **Install deps**: `uv sync`
3. **Optional**: set `DATABASE_URL` (default: `postgresql+asyncpg://toolme:toolme@localhost:5432/toolme`).
4. **Run**: `uv run uvicorn app.main:app --reload --port 8030` (or `make dev-backend` from repo root).

## API

- **Docs**: http://localhost:8030/docs
- **Projects CRUD**: `GET/POST /projects`, `GET/PUT/DELETE /projects/{id}`
