"""App config from environment."""

import os

# At least 32 bytes for HS256 (RFC 7518); dev default for local/Docker only
DEV_SECRET = "dev-secret-change-in-production-32b"
# Empty or unset → use dev default (e.g. Docker dev without SECRET_KEY in .env)
SECRET_KEY: str = os.getenv("SECRET_KEY") or DEV_SECRET
ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"),
)

_ENV = os.getenv("ENVIRONMENT", "development")

# CORS (M-1): comma-separated origins; in production require explicit origin(s)
_DEFAULT_CORS = "http://localhost:5173"
_CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", _DEFAULT_CORS)
CORS_ORIGINS = [o.strip() for o in _CORS_ORIGINS_RAW.split(",") if o.strip()]
if _ENV == "production":
    if "*" in CORS_ORIGINS or not CORS_ORIGINS:
        raise SystemExit(
            "In production, CORS_ORIGINS must be set to explicit origin(s), not '*' and not empty."
        )
    if _CORS_ORIGINS_RAW == _DEFAULT_CORS and os.getenv("CORS_ORIGINS") is None:
        raise SystemExit(
            "In production, CORS_ORIGINS must be set explicitly (e.g. https://app.toolme.example)."
        )

# Seed (M-3): set RUN_SEED=false in production to skip seed user/projects
RUN_SEED = os.getenv("RUN_SEED", "true").lower() in ("true", "1", "yes")
# In production, if seed runs, a strong SEED_PASSWORD must be set
SEED_PASSWORD = os.getenv("SEED_PASSWORD", "seed-change-me")
if _ENV == "production" and RUN_SEED and SEED_PASSWORD == "seed-change-me":
    raise SystemExit(
        "In production with RUN_SEED enabled, SEED_PASSWORD must be set to a strong value."
    )

# HTTP-only auth cookie (E-2): Secure in production, SameSite=Lax
AUTH_COOKIE_NAME = "toolme_access_token"
AUTH_COOKIE_SECURE = _ENV == "production"
AUTH_COOKIE_SAMESITE = "lax"
AUTH_COOKIE_HTTPONLY = True
AUTH_COOKIE_PATH = "/"

# Password reset: token validity 1h; email via SMTP
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 60
# Email verification: link validity (hours)
EMAIL_VERIFICATION_EXPIRE_HOURS = 24
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@toolme.example")
# Use SSL from the start (e.g. port 465). If false, uses STARTTLS on port 587 (unless SMTP_SKIP_STARTTLS).
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").lower() in ("true", "1", "yes")
# Skip STARTTLS (plain SMTP). Set true for Mailpit and other dev catch-all servers that don't support TLS.
SMTP_SKIP_STARTTLS = os.getenv("SMTP_SKIP_STARTTLS", "false").lower() in ("true", "1", "yes")
# In dev when SMTP not configured: write last email link to this file (optional)
EMAIL_DEV_FILE = os.getenv("EMAIL_DEV_FILE", "")
# Frontend base URL for reset link (e.g. http://localhost:5173 or https://app.toolme.example)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Lockout after N failed login attempts
MAX_LOGIN_ATTEMPTS = 5

# In production, refuse to start if SECRET_KEY is missing or still the dev default
if _ENV == "production":
    if SECRET_KEY == DEV_SECRET:
        raise SystemExit(
            "SECRET_KEY must be set in production and must not be the dev default."
        )
