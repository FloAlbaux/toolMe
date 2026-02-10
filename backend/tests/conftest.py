import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal, engine
from app.main import app
from app.models.base import Base
from app.models.project import Project  # noqa: F401 - register with Base
from app.seed import seed_if_empty


@pytest.fixture
def client():
    """FastAPI test client. Lifespan runs on first request (tables + seed)."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
async def ensure_tables():
    """Create tables and seed once per test session (same event loop for all async tests)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_if_empty(session)


@pytest.fixture
async def db_session(ensure_tables):
    """Async DB session for direct crud tests."""
    async with AsyncSessionLocal() as session:
        yield session
