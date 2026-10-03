import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.analytics import kpis as kpi_service
from app.api.deps import get_optional_user
from app.database.deps import get_db

router = APIRouter()

# report name -> minimum role allowed to export it
REPORT_ACCESS = {
    "kpis": "viewer",
    "monthly_revenue": "analyst",
    "revenue_by_category": "analyst",
    "orders_by_status": "viewer",
}

ROLE_RANK = {"viewer": 1, "analyst": 2, "admin": 3}


def _to_csv(rows: list[dict]) -> str:
    if not rows:
        return ""
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    return buf.getvalue()


def _build_rows(report: str, db: Session, filters: dict) -> list[dict]:
    if report == "kpis":
        data = kpi_service.get_kpis(db, **filters)["kpis"]
        return [{"metric": k, "value": v} for k, v in data.items()]
    if report == "monthly_revenue":
        return kpi_service.monthly_revenue(db)
    if report == "revenue_by_category":
        return kpi_service.revenue_by_category(db)
    if report == "orders_by_status":
        return kpi_service.orders_by_status(db)
    raise HTTPException(status_code=404, detail=f"unknown report '{report}'")


@router.get("/export")
def export_report(
    report: str = Query("kpis"),
    date_from: str | None = None,
    date_to: str | None = None,
    order_status: str | None = None,
    db: Session = Depends(get_db),
    user: dict | None = Depends(get_optional_user),
):
    if report not in REPORT_ACCESS:
        raise HTTPException(status_code=404, detail=f"unknown report '{report}'")

    role = (user or {}).get("role", "viewer")
    if ROLE_RANK.get(role, 0) < ROLE_RANK[REPORT_ACCESS[report]]:
        raise HTTPException(
            status_code=403, detail=f"Requires {REPORT_ACCESS[report]} role to export '{report}'"
        )

    filters = {"date_from": date_from, "date_to": date_to, "order_status": order_status}
    rows = _build_rows(report, db, filters)
    csv_text = _to_csv(rows)

    return StreamingResponse(
        iter([csv_text]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{report}.csv"'},
    )
