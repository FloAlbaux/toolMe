from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse


def _row_to_response(row: User) -> UserResponse:
    return UserResponse(id=row.id, email=row.email)


async def create_user(db: AsyncSession, payload: UserCreate) -> UserResponse:
    user = User(
        email=payload.email.lower().strip(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return _row_to_response(user)


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(
        select(User).where(User.email == email.lower().strip())
    )
    return result.scalar_one_or_none()
