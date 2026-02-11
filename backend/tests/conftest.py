import os

# Relax rate limit in tests so auth endpoints don't throttle (E-1)
os.environ.setdefault("RATE_LIMIT_AUTH", "1000/minute")
# So signup returns verification_token in response (tests only)
os.environ.setdefault("ENVIRONMENT", "test")

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token
from app.database import AsyncSessionLocal, engine
from app.main import app
from app.models.base import Base
from app.models.message import Message  # noqa: F401 - register with Base
from app.models.project import Project  # noqa: F401 - register with Base
from app.models.submission import Submission  # noqa: F401 - register with Base
from app.models.user import User  # noqa: F401 - register with Base
from app.seed import seed_if_empty


def verify_user_for_tests(client: TestClient, email: str, signup_response: dict | None = None) -> None:
    """After signup, verify the user so they can log in (tests only). Uses token from signup response when ENVIRONMENT=test."""
    token = signup_response.get("verification_token") if signup_response else None
    if not token:
        raise ValueError("No verification_token in signup response; set ENVIRONMENT=test in conftest")
    r = client.post("/auth/verify-email", json={"token": token})
    assert r.status_code == 200, r.text


@pytest.fixture
def client():
    """FastAPI test client. Lifespan runs on first request (tables + seed)."""
    with TestClient(app, raise_server_exceptions=False) as c:
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


@pytest.fixture
def auth_headers(client: TestClient):
    """Create a user, verify email, log in, return headers with Bearer token for protected routes."""
    email = f"test-{uuid.uuid4().hex}@example.com"
    password = "testpass1234"  # backend requires >= 12 chars
    r = client.post(
        "/auth/signup",
        json={"email": email, "password": password, "password_confirm": password},
    )
    assert r.status_code == 201, r.text
    verify_user_for_tests(client, email, r.json())
    r2 = client.post("/auth/login", json={"email": email, "password": password})
    assert r2.status_code == 200, r.text
    token = r2.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def seed_user_id(db_session: AsyncSession):
    """Return the seed user id for crud tests (seed_if_empty creates this user)."""
    result = await db_session.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    assert user is not None, "Seed user should exist after ensure_tables"
    return user.id
