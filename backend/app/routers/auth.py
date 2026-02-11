from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, verify_password
from app.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    AUTH_COOKIE_HTTPONLY,
    AUTH_COOKIE_NAME,
    AUTH_COOKIE_PATH,
    AUTH_COOKIE_SAMESITE,
    AUTH_COOKIE_SECURE,
)
from app.crud.users import create_user, get_user_by_email
from app.database import get_db
from app.dependencies import get_current_user
from app.limiter import AUTH_RATE_LIMIT, limiter
from app.models.user import User
from app.schemas.user import EMAIL_REGEX, Token, UserCreate, UserResponse, UserSignUp

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=201)
@limiter.limit(AUTH_RATE_LIMIT)
async def signup(
    request: Request,
    payload: UserSignUp,
    db: AsyncSession = Depends(get_db),
):
    """Create a new account. Returns user (id, email). Rechecks password == password_confirm (401 if not)."""
    if payload.password != payload.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Passwords do not match",
        )
    if len(payload.password) < 12:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password must be at least 12 characters",
        )

    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user_response = await create_user(db, payload)
    return user_response


@router.post("/login", response_model=Token)
@limiter.limit(AUTH_RATE_LIMIT)
async def login(
    request: Request,
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Log in with email and password. Returns JWT and sets HTTP-only cookie (E-2)."""
    user = await get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(sub=user.id, email=user.email)
    content = {"access_token": token, "token_type": "bearer"}
    response = JSONResponse(content=content)
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path=AUTH_COOKIE_PATH,
        secure=AUTH_COOKIE_SECURE,
        httponly=AUTH_COOKIE_HTTPONLY,
        samesite=AUTH_COOKIE_SAMESITE,
    )
    return response


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Return current user from cookie or Bearer token (E-2)."""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout():
    """Clear auth cookie. Frontend should call with credentials to send cookie."""
    response = JSONResponse(content={"detail": "Logged out"})
    response.delete_cookie(key=AUTH_COOKIE_NAME, path=AUTH_COOKIE_PATH)
    return response
