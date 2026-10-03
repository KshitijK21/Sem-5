"""In-memory user registry with hashed passwords and roles.

Default credentials are documented and overridable via env (AUTH_*_PASSWORD).
Passwords are stored only as bcrypt hashes; plain values are never persisted.
"""

from __future__ import annotations

from app.core.config import settings
from app.core.security import hash_password, verify_password

# role hierarchy: higher number = more privileges
ROLE_RANK = {"viewer": 1, "analyst": 2, "admin": 3}

_SEED = {
    "admin": ("admin", settings.AUTH_ADMIN_PASSWORD),
    "analyst": ("analyst", settings.AUTH_ANALYST_PASSWORD),
    "viewer": ("viewer", settings.AUTH_VIEWER_PASSWORD),
}

USERS: dict[str, dict] = {
    username: {
        "id": idx + 1,
        "username": username,
        "role": role,
        "hashed_password": hash_password(password),
    }
    for idx, (username, (role, password)) in enumerate(_SEED.items())
}


def get_user(username: str) -> dict | None:
    return USERS.get(username)


def authenticate(username: str, password: str) -> dict | None:
    user = USERS.get(username)
    if user and verify_password(password, user["hashed_password"]):
        return user
    return None


def has_role(user: dict, *roles: str) -> bool:
    return user.get("role") in roles


def role_at_least(user: dict, min_role: str) -> bool:
    return ROLE_RANK.get(user.get("role", ""), 0) >= ROLE_RANK.get(min_role, 99)
