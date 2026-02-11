import os

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    create_access_token,
    email_verification_expiry,
    generate_email_verification_token,
    generate_password_reset_token,
    password_reset_expiry,
    verify_password,
)
from app.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    AUTH_COOKIE_HTTPONLY,
    AUTH_COOKIE_NAME,
    AUTH_COOKIE_PATH,
    AUTH_COOKIE_SAMESITE,
    AUTH_COOKIE_SECURE,
    MAX_LOGIN_ATTEMPTS,
)
from app.crud.users import (
    clear_password_reset_token,
    create_user,
    get_user_by_email,
    get_user_by_reset_token,
    get_user_by_verification_token,
    increment_failed_login,
    lock_user,
    mark_email_verified,
    reset_login_attempts_and_unlock,
    set_email_verification_token,
    set_password_reset_token,
    set_user_password,
    delete_user as crud_delete_user,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.email_client import send_password_reset_email, send_verification_email
from app.limiter import AUTH_RATE_LIMIT, limiter
from app.models.user import User
from app.schemas.user import (
    DeleteAccountRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserResponse,
    UserSignUp,
    VerifyEmailRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookie(response: JSONResponse, token: str) -> None:
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path=AUTH_COOKIE_PATH,
        secure=AUTH_COOKIE_SECURE,
        httponly=AUTH_COOKIE_HTTPONLY,
        samesite=AUTH_COOKIE_SAMESITE,
    )


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
    user = await get_user_by_email(db, payload.email)
    token = None
    verification_link = None
    if user:
        token = generate_email_verification_token()
        expires_at = email_verification_expiry()
        await set_email_verification_token(db, user, token, expires_at)
        verification_link = send_verification_email(user.email, token)
    # In test env, return verification_token so tests can verify without DB access
    if os.getenv("ENVIRONMENT") == "test" and token:
        return JSONResponse(
            status_code=201,
            content={
                "id": user_response.id,
                "email": user_response.email,
                "verification_token": token,
            },
        )
    # In development without SMTP, return link so frontend can display it
    if os.getenv("ENVIRONMENT") == "development" and verification_link:
        return JSONResponse(
            status_code=201,
            content={
                "id": user_response.id,
                "email": user_response.email,
                "verification_link": verification_link,
            },
        )
    return user_response


@router.post("/login", response_model=Token)
@limiter.limit(AUTH_RATE_LIMIT)
async def login(
    request: Request,
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Log in with email and password. Lockout after 5 failed attempts; reactivate via forgot password."""
    user = await get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if user.email_verified_at is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email to activate your account. Check your inbox for the activation link.",
        )
    if user.locked_until:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account locked due to too many failed attempts. Use \"Forgot password\" to reactivate.",
        )
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(payload.password, user.password_hash):
        await increment_failed_login(db, user)
        if (user.failed_login_attempts or 0) >= MAX_LOGIN_ATTEMPTS:
            await lock_user(db, user)
        await db.commit()  # persist lockout state before raising (get_db would rollback on exception)
        if (user.failed_login_attempts or 0) >= MAX_LOGIN_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account locked due to too many failed attempts. Use \"Forgot password\" to reactivate.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    await reset_login_attempts_and_unlock(db, user)
    token = create_access_token(sub=user.id, email=user.email)
    response = JSONResponse(content={"access_token": token, "token_type": "bearer"})
    _set_auth_cookie(response, token)
    return response


@router.post("/forgot-password")
@limiter.limit("5/hour")  # prevent abuse
async def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send password reset email. Token valid 1h; user must set new password. Always 200 to avoid email enumeration."""
    user = await get_user_by_email(db, payload.email)
    reset_link = None
    if user:
        reset_token = generate_password_reset_token()
        expires_at = password_reset_expiry()
        await set_password_reset_token(db, user, reset_token, expires_at)
        reset_link = send_password_reset_email(user.email, reset_token)
    out = {"detail": "If an account exists for this email, you will receive a reset link."}
    if os.getenv("ENVIRONMENT") == "development" and reset_link:
        out["reset_link"] = reset_link
    return out


@router.post("/reset-password", response_model=Token)
@limiter.limit(AUTH_RATE_LIMIT)
async def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Set new password with valid reset token. Unlocks account and logs user in."""
    user = await get_user_by_reset_token(db, payload.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link. Request a new one.",
        )
    await set_user_password(db, user, payload.new_password)
    await clear_password_reset_token(db, user)
    await reset_login_attempts_and_unlock(db, user)
    token = create_access_token(sub=user.id, email=user.email)
    response = JSONResponse(content={"access_token": token, "token_type": "bearer"})
    _set_auth_cookie(response, token)
    return response


@router.post("/verify-email", response_model=Token)
@limiter.limit(AUTH_RATE_LIMIT)
async def verify_email(
    request: Request,
    payload: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    """Activate account with token from email. Logs the user in on success."""
    user = await get_user_by_verification_token(db, payload.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired activation link. You can sign up again or request a new link.",
        )
    await mark_email_verified(db, user)
    token = create_access_token(sub=user.id, email=user.email)
    response = JSONResponse(content={"access_token": token, "token_type": "bearer"})
    _set_auth_cookie(response, token)
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


@router.post("/delete-account")
async def delete_account(
    request: Request,
    payload: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete the current user account and all associated data. Password required for email/password accounts."""
    if current_user.password_hash:
        if not payload.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required to delete your account",
            )
        if not verify_password(payload.password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password",
            )
    await crud_delete_user(db, current_user)
    response = JSONResponse(content={"detail": "Account deleted"})
    response.delete_cookie(key=AUTH_COOKIE_NAME, path=AUTH_COOKIE_PATH)
    return response
