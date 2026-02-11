from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import AsyncSessionLocal, engine
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
        # Migration: add created_at to projects if missing
        await conn.execute(
            text(
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at "
                "TIMESTAMPTZ NOT NULL DEFAULT now()"
            )
        )
        # Migration: add user_id to projects if missing (nullable first)
        await conn.execute(
            text(
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id "
                "VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE"
            )
        )
    # Backfill user_id for existing projects: create seed user and assign
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select, update

        result = await db.execute(
            select(Project).where(Project.user_id.is_(None)).limit(1)
        )
        if result.scalar_one_or_none() is not None:
            from app.auth import hash_password

            seed_user = User(
                email="seed@toolme.local",
                password_hash=hash_password("seed-change-me"),
            )
            db.add(seed_user)
            await db.flush()
            await db.execute(
                update(Project)
                .where(Project.user_id.is_(None))
                .values(user_id=seed_user.id)
            )
            await db.commit()
        await seed_if_empty(db)
    # Enforce user_id NOT NULL after backfill
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL"
            )
        )
    yield
    await engine.dispose()


app = FastAPI(
    title="ToolMe API",
    description="The sandbox where your projects matter.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
