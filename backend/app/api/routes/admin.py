import platform
import sys
import time
from datetime import datetime, timezone

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


@router.get("/warehouse/status")
def warehouse_status(_: dict = Depends(require_roles("admin"))):
    """Warehouse administration: schema presence, row counts and load state."""
    insp = inspect(engine)
    existing = set(insp.get_table_names())
    counts = _table_counts()
    loaded_tables = sum(1 for v in counts.values() if v)
    total_rows = sum(v for v in counts.values() if v)
    return {
        "dialect": engine.dialect.name,
        "schema_tables": sorted(existing),
        "warehouse_tables": counts,
        "expected_tables": len(WAREHOUSE_TABLES),
        "loaded_tables": loaded_tables,
        "total_rows": total_rows,
        "complete": loaded_tables == len(WAREHOUSE_TABLES),
        "source": str(_olist_dir()),
    }


@router.get("/ml/status")
def ml_admin_status(_: dict = Depends(require_roles("admin"))):
    """ML administration: deployed artifacts and training state on disk."""
    from pathlib import Path

    from app.services import ml as ml_service

    models_dir = ml_service.models_dir()
    artifacts = []
    if models_dir.exists():
        for path in sorted(models_dir.glob("*.joblib")):
            stat = path.stat()
            artifacts.append(
                {
                    "file": path.name,
                    "size_bytes": stat.st_size,
                    "modified_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                }
            )
    features = ml_service.feature_status()
    trained = sum(1 for f in features for m in f["models"])
    return {
        "models_dir": str(models_dir),
        "artifacts": artifacts,
        "artifact_count": len(artifacts),
        "metadata_entries": trained,
        "features": features,
        "data_dir_exists": Path(ml_service.processed_dir()).exists(),
        "retraining": "manual (python ml/run_all.py)",
    }


@router.get("/settings")
def system_settings(_: dict = Depends(require_roles("admin"))):
    """Non-secret application settings. Secrets are never returned."""
    return {
        "app": "Sem5 BI Platform",
        "version": "0.1.0",
        "env": settings.ENV,
        "auth_required": settings.AUTH_REQUIRED,
        "access_token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "refresh_token_expire_minutes": settings.REFRESH_TOKEN_EXPIRE_MINUTES,
        "roles": ["admin", "analyst"],
        "llm": {
            "enabled": settings.ENABLE_LLM_ASSISTANT,
            "provider": settings.LLM_PROVIDER,
            "timeout_seconds": settings.LLM_TIMEOUT_SECONDS,
        },
        "dataset": "Olist Brazilian E-Commerce Public Dataset",
        "reports": ["kpis", "monthly_revenue", "revenue_by_category", "orders_by_status"],
        "secrets_exposed": False,
    }
