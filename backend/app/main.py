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
from app.models.message import Message  # noqa: F401 - register with Base
from app.models.project import Project  # noqa: F401 - register with Base
from app.models.submission import Submission  # noqa: F401 - register with Base
from app.models.user import User  # noqa: F401 - register with Base
from app.routers import auth, projects, submissions
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
        # Epic 4: one submission per (project, learner) — add unique constraint if missing
        await conn.execute(
            text(
                "DO $$ BEGIN "
                "IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions') "
                "AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_submission_project_learner') THEN "
                "ALTER TABLE submissions ADD CONSTRAINT uq_submission_project_learner "
                "UNIQUE (project_id, learner_id); "
                "END IF; END $$"
            )
        )
        # Unread messages: when learner/owner last opened the thread
        await conn.execute(
            text(
                "ALTER TABLE submissions ADD COLUMN IF NOT EXISTS learner_last_read_at TIMESTAMPTZ"
            )
        )
        await conn.execute(
            text(
                "ALTER TABLE submissions ADD COLUMN IF NOT EXISTS owner_last_read_at TIMESTAMPTZ"
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
app.include_router(submissions.router)


@app.get("/health")
def health():
    """Readiness/health check for the API."""
    return {"status": "ok"}


@app.get("/")
def root():
    """API root."""
    return {"message": "ToolMe API", "docs": "/docs"}
