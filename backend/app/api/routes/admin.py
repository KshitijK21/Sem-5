import platform
import sys
import time

from fastapi import APIRouter, Depends
from sqlalchemy import inspect, text

from app.api.deps import require_roles
from app.core.config import settings
from app.database.session import engine

router = APIRouter()

WAREHOUSE_TABLES = [
    "dim_customer",
    "dim_product",
    "dim_seller",
    "dim_date",
    "fact_orders",
    "fact_order_items",
]

_STARTED_AT = time.time()


def _table_counts() -> dict[str, int | None]:
    insp = inspect(engine)
    existing = set(insp.get_table_names())
    counts: dict[str, int | None] = {}
    with engine.connect() as conn:
        for table in WAREHOUSE_TABLES:
            if table in existing:
                counts[table] = int(conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar() or 0)
            else:
                counts[table] = None
    return counts


@router.get("/system/status")
def system_status(_: dict = Depends(require_roles("admin"))):
    return {
        "app": "Sem5 BI Platform",
        "version": "0.1.0",
        "env": settings.ENV,
        "auth_required": settings.AUTH_REQUIRED,
        "database": settings.DATABASE_URL.split("://", 1)[0],
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "uptime_seconds": round(time.time() - _STARTED_AT, 1),
    }


@router.get("/data/etl/status")
def etl_status(_: dict = Depends(require_roles("admin"))):
    counts = _table_counts()
    loaded = bool(counts.get("fact_orders"))
    return {
        "loaded": loaded,
        "tables": counts,
        "olist_dir": str(_olist_dir()),
    }


def _olist_dir() -> str:
    import os
    from pathlib import Path

    env = os.getenv("OLIST_DIR")
    if env:
        return env
    return str(Path(os.environ.get("USERPROFILE", Path.home())) / "Downloads" / "olist")
