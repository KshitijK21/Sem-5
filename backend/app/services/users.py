"""DB-backed user registry with hashed passwords and roles.

Users live in the `app_user` table. Default accounts are seeded on first use
from the AUTH_*_PASSWORD settings. Passwords are stored only as bcrypt hashes.
"""

from __future__ import annotations

from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.database.session import Base, SessionLocal, engine
from app.models.user import User

# role hierarchy: higher number = more privileges
ROLE_RANK = {"viewer": 1, "analyst": 2, "admin": 3}

_SEED = {
    "admin": ("admin", settings.AUTH_ADMIN_PASSWORD),
    "analyst": ("analyst", settings.AUTH_ANALYST_PASSWORD),
    "viewer": ("viewer", settings.AUTH_VIEWER_PASSWORD),
}


def _ensure_schema() -> None:
    Base.metadata.create_all(engine, tables=[User.__table__])
    with SessionLocal() as db:
        if db.scalar(select(User.id).limit(1)) is None:
            for username, (role, password) in _SEED.items():
                db.add(User(username=username, role=role, hashed_password=hash_password(password)))
            db.commit()


def _to_dict(user: User) -> dict:
    return {"id": user.id, "username": user.username, "role": user.role}


def get_user(username: str) -> dict | None:
    _ensure_schema()
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == username))
        return _to_dict(user) if user else None


def list_users() -> list[dict]:
    _ensure_schema()
    with SessionLocal() as db:
        return [_to_dict(u) for u in db.scalars(select(User).order_by(User.id)).all()]


def authenticate(username: str, password: str) -> dict | None:
    _ensure_schema()
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == username))
        if user and verify_password(password, user.hashed_password):
            return _to_dict(user)
    return None


def create_user(username: str, password: str, role: str = "viewer") -> dict:
    _ensure_schema()
    if role not in ROLE_RANK:
        raise ValueError(f"invalid role: {role}")
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.username == username)):
            raise ValueError("username already exists")
        user = User(username=username, role=role, hashed_password=hash_password(password))
        db.add(user)
        db.commit()
        db.refresh(user)
        return _to_dict(user)


def update_password(username: str, new_password: str) -> bool:
    _ensure_schema()
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == username))
        if not user:
            return False
        user.hashed_password = hash_password(new_password)
        db.commit()
        return True


def update_role(username: str, role: str) -> dict | None:
    _ensure_schema()
    if role not in ROLE_RANK:
        raise ValueError(f"invalid role: {role}")
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == username))
        if not user:
            return None
        user.role = role
        db.commit()
        return _to_dict(user)


def has_role(user: dict, *roles: str) -> bool:
    return user.get("role") in roles


def role_at_least(user: dict, min_role: str) -> bool:
    return ROLE_RANK.get(user.get("role", ""), 0) >= ROLE_RANK.get(min_role, 99)
