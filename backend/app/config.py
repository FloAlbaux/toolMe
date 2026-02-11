"""App config from environment."""

import os

DEV_SECRET = "dev-secret-change-in-production"
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

# In production, refuse to start if SECRET_KEY is missing or still the dev default
if _ENV == "production":
    if SECRET_KEY == DEV_SECRET:
        raise SystemExit(
            "SECRET_KEY must be set in production and must not be the dev default."
        )
