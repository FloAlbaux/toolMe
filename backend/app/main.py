from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import AsyncSessionLocal, engine
from app.models.base import Base
from app.models.project import Project  # noqa: F401 - register with Base
from app.routers import projects
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)


@app.get("/health")
def health():
    """Readiness/health check for the API."""
    return {"status": "ok"}


@app.get("/")
def root():
    """API root."""
    return {"message": "ToolMe API", "docs": "/docs"}
