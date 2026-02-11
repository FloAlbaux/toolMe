from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, verify_password
from app.crud.users import create_user, get_user_by_email
from app.database import get_db
from app.schemas.user import EMAIL_REGEX, Token, UserCreate, UserResponse, UserSignUp

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=201)
async def signup(
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
async def login(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Log in with email and password. Returns JWT access token."""
    user = await get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(sub=user.id, email=user.email)
    return Token(access_token=token, token_type="bearer")
