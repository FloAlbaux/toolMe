"""FastAPI dependencies for auth."""

from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import decode_access_token
from app.config import AUTH_COOKIE_NAME
from app.crud.users import get_user_by_id
from app.database import get_db
from app.models.user import User

security = HTTPBearer(auto_error=False)


def _get_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    cookie_token: str | None = Cookie(None, alias=AUTH_COOKIE_NAME),
) -> str | None:
    """Token from Authorization header or HTTP-only cookie (E-2)."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials
    return cookie_token


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    cookie_token: str | None = Cookie(None, alias=AUTH_COOKIE_NAME),
) -> User:
    token = _get_token(request, credentials, cookie_token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    cookie_token: str | None = Cookie(None, alias=AUTH_COOKIE_NAME),
) -> User | None:
    token = _get_token(request, credentials, cookie_token)
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    return await get_user_by_id(db, payload["sub"])
