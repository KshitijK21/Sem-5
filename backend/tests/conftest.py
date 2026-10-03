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
