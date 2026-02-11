from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserSignUp


def _row_to_response(row: User) -> UserResponse:
    return UserResponse(id=row.id, email=row.email)


async def create_user(
    db: AsyncSession, payload: UserCreate | UserSignUp
) -> UserResponse:
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return _row_to_response(user)


async def create_user_google(db: AsyncSession, email: str, google_id: str) -> UserResponse:
    """Create user for Google sign-in (no password)."""
    user = User(
        email=email.lower().strip(),
        password_hash=None,
        google_id=google_id,
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


async def get_user_by_google_id(db: AsyncSession, google_id: str) -> User | None:
    result = await db.execute(select(User).where(User.google_id == google_id))
    return result.scalar_one_or_none()


async def get_user_by_reset_token(db: AsyncSession, token: str) -> User | None:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(User).where(
            User.password_reset_token == token,
            User.password_reset_expires_at.isnot(None),
            User.password_reset_expires_at > now,
        )
    )
    return result.scalar_one_or_none()


async def increment_failed_login(db: AsyncSession, user: User) -> None:
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    await db.flush()


async def lock_user(db: AsyncSession, user: User) -> None:
    user.locked_until = datetime.now(timezone.utc)  # any non-null = locked
    await db.flush()


async def reset_login_attempts_and_unlock(db: AsyncSession, user: User) -> None:
    user.failed_login_attempts = 0
    user.locked_until = None
    await db.flush()


async def set_password_reset_token(
    db: AsyncSession, user: User, token: str, expires_at: datetime
) -> None:
    user.password_reset_token = token
    user.password_reset_expires_at = expires_at
    await db.flush()


async def clear_password_reset_token(db: AsyncSession, user: User) -> None:
    user.password_reset_token = None
    user.password_reset_expires_at = None
    await db.flush()


async def get_user_by_verification_token(db: AsyncSession, token: str) -> User | None:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(User).where(
            User.email_verification_token == token,
            User.email_verification_expires_at.isnot(None),
            User.email_verification_expires_at > now,
        )
    )
    return result.scalar_one_or_none()


async def set_email_verification_token(
    db: AsyncSession, user: User, token: str, expires_at: datetime
) -> None:
    user.email_verification_token = token
    user.email_verification_expires_at = expires_at
    await db.flush()


async def mark_email_verified(db: AsyncSession, user: User) -> None:
    user.email_verified_at = datetime.now(timezone.utc)
    user.email_verification_token = None
    user.email_verification_expires_at = None
    await db.flush()


async def set_user_password(db: AsyncSession, user: User, new_password: str) -> None:
    user.password_hash = hash_password(new_password)
    await db.flush()


async def link_google_to_user(db: AsyncSession, user: User, google_id: str) -> None:
    user.google_id = google_id
    await db.flush()


async def delete_user(db: AsyncSession, user: User) -> None:
    await db.delete(user)
    await db.flush()
