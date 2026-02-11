"""Password hashing (bcrypt), JWT handling, and reset token. Do not use passlib."""

import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    EMAIL_VERIFICATION_EXPIRE_HOURS,
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("ascii")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        plain.encode("utf-8"),
        hashed.encode("ascii"),
    )


def create_access_token(sub: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": sub,
        "email": email,
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None


def generate_password_reset_token() -> str:
    return secrets.token_urlsafe(32)


def password_reset_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        minutes=PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    )


def generate_email_verification_token() -> str:
    return secrets.token_urlsafe(32)


def email_verification_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(hours=EMAIL_VERIFICATION_EXPIRE_HOURS)
