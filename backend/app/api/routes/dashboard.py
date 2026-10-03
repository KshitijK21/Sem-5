from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.analytics import kpis as kpi_service
from app.database.deps import get_db

router = APIRouter()


@router.get("/kpis")
def kpis(
    date_from: Optional[str] = Query(default=None, description="ISO date, inclusive"),
    date_to: Optional[str] = Query(default=None, description="ISO date, inclusive"),
    order_status: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """Return verified business KPIs computed from the loaded Olist warehouse.

    Values come from real data via the ETL pipeline (see docs/KPIs.md).
    """
    return kpi_service.get_kpis(db, date_from=date_from, date_to=date_to, order_status=order_status)


@router.get("/monthly-revenue")
def monthly_revenue(db: Session = Depends(get_db)):
    return {"series": kpi_service.monthly_revenue(db)}


@router.get("/revenue-by-category")
def revenue_by_category(db: Session = Depends(get_db)):
    return {"series": kpi_service.revenue_by_category(db)}


@router.get("/orders-by-status")
def orders_by_status(db: Session = Depends(get_db)):
    return {"series": kpi_service.orders_by_status(db)}
