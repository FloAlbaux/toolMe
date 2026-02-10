"""Async database engine and session for PostgreSQL."""

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Build from env vars if DATABASE_URL not set (no password in default URL)
if url := os.getenv("DATABASE_URL"):
    DATABASE_URL = url
else:
    user = os.getenv("POSTGRES_USER", "toolme")
    password = os.getenv("POSTGRES_PASSWORD", "toolme")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    dbname = os.getenv("POSTGRES_DB", "toolme")
    DATABASE_URL = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{dbname}"

engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "0") == "1",
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
