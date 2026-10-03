"""Pytest fixtures for the backend API tests."""

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]

# Ensure the dev SQLite DB resolves regardless of the invocation directory.
os.environ.setdefault("DATABASE_URL", f"sqlite:///{(BACKEND_DIR / 'sem5.db').as_posix()}")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


def _warehouse_count(table: str) -> int:
    from sqlalchemy import inspect, text

    from app.database.session import engine

    insp = inspect(engine)
    if table not in insp.get_table_names():
        return 0
    with engine.connect() as conn:
        return int(conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar() or 0)


@pytest.fixture(scope="session")
def warehouse_ready() -> bool:
    return _warehouse_count("fact_orders") > 0


def _token(client: TestClient, username: str, password: str) -> str:
    r = client.post("/api/auth/login", data={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_token(client: TestClient) -> str:
    return _token(client, "admin", "admin123")


@pytest.fixture(scope="session")
def viewer_token(client: TestClient) -> str:
    return _token(client, "viewer", "viewer123")


@pytest.fixture()
def auth(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}
