from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text

from app.config import CORS_ORIGINS, RUN_SEED
from app.database import AsyncSessionLocal, engine
from app.limiter import limiter
from app.models.base import Base
from app.models.project import Project  # noqa: F401 - register with Base
from app.models.user import User  # noqa: F401 - register with Base
from app.routers import auth, projects
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables (users first, then projects with user_id FK)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add created_at to existing projects table if missing (migration)
        await conn.execute(
            text(
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at "
                "TIMESTAMPTZ NOT NULL DEFAULT now()"
            )
        )
    # Seed if empty
    async with AsyncSessionLocal() as db:
        await seed_if_empty(db)
    yield
    await engine.dispose()


app = FastAPI(
    title="ToolMe API",
    description="The sandbox where your projects matter.",
    version="0.1.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)


@app.get("/health")
def health():
    """Readiness/health check for the API."""
    return {"status": "ok"}


@app.get("/")
def root():
    """API root."""
    return {"message": "ToolMe API", "docs": "/docs"}
