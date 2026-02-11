"""Rate limiter for auth and other endpoints."""

import os

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Configurable so tests can use a higher limit (e.g. RATE_LIMIT_AUTH=1000/minute)
AUTH_RATE_LIMIT = os.getenv("RATE_LIMIT_AUTH", "10/minute")
