"""Authentication and authorization dependencies."""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import decode_token
from app.services import users as user_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_optional_user(token: str | None = Depends(oauth2_scheme)) -> dict | None:
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    return user_service.get_user(payload.get("sub", ""))


def get_current_user(user: dict | None = Depends(get_optional_user)) -> dict:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_roles(*roles: str):
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role in {roles}",
            )
        return user

    return checker


def require_min_role(min_role: str):
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if not user_service.role_at_least(user, min_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {min_role} or higher",
            )
        return user

    return checker


def auth_gate(user: dict | None = Depends(get_optional_user)) -> None:
    """Global gate: enforce authentication on protected routers when enabled.

    In dev (AUTH_REQUIRED=false) requests pass through unauthenticated so the
    app is usable. Set AUTH_REQUIRED=true to enforce auth on all protected
    routers. Admin/sensitive endpoints enforce roles regardless.
    """
    if settings.AUTH_REQUIRED and not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
