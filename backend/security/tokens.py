"""JWT token utilities for Bread Buddy auth."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

import jwt
from jwt import InvalidTokenError


ALGORITHM = "HS256"
DEFAULT_ISSUER = "bread-buddy-api"
DEFAULT_ACCESS_MINUTES = 15
DEFAULT_REFRESH_DAYS = 30


def _get_int_env(name: str, default: int, *, minimum: int = 1) -> int:
    value = os.getenv(name, str(default)).strip()
    try:
        parsed = int(value)
    except ValueError:
        return default
    return parsed if parsed >= minimum else default


def _get_jwt_secret() -> str:
    """Return the signing key.

    For local development, a fallback key is used when JWT_SECRET_KEY is not set.
    """
    return os.getenv("JWT_SECRET_KEY", "bread-buddy-dev-secret-change-me")


def _token_expiry(token_type: str) -> timedelta:
    if token_type == "access":
        minutes = _get_int_env("JWT_ACCESS_EXPIRE_MINUTES", DEFAULT_ACCESS_MINUTES)
        return timedelta(minutes=minutes)

    days = _get_int_env("JWT_REFRESH_EXPIRE_DAYS", DEFAULT_REFRESH_DAYS)
    return timedelta(days=days)


def _issuer() -> str:
    return os.getenv("JWT_ISSUER", DEFAULT_ISSUER)


def _build_token(*, user_id: str, username: str, token_type: str) -> tuple[str, int]:
    now = datetime.now(timezone.utc)
    expires_at = now + _token_expiry(token_type)

    payload = {
        "sub": user_id,
        "username": username,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
        "iss": _issuer(),
        "jti": str(uuid4()),
    }

    token = jwt.encode(payload, _get_jwt_secret(), algorithm=ALGORITHM)
    return token, int((expires_at - now).total_seconds())


def create_token_pair(*, user_id: str, username: str) -> dict[str, Any]:
    """Create access and refresh tokens for the authenticated user."""
    access_token, access_expires_in = _build_token(
        user_id=user_id,
        username=username,
        token_type="access",
    )
    refresh_token, refresh_expires_in = _build_token(
        user_id=user_id,
        username=username,
        token_type="refresh",
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "access_token_expires_in": access_expires_in,
        "refresh_token_expires_in": refresh_expires_in,
    }


def decode_refresh_token(token: str) -> dict[str, Any]:
    """Decode and validate a refresh token payload."""
    try:
        payload = jwt.decode(
            token,
            _get_jwt_secret(),
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat", "sub", "type"]},
            issuer=_issuer(),
        )
    except InvalidTokenError as exc:
        raise ValueError("Invalid token") from exc

    if payload.get("type") != "refresh":
        raise ValueError("Token is not a refresh token")

    return payload
