from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.analytics import kpis as kpi_service
from app.database.deps import get_db

router = APIRouter()


@router.get("/sales")
def sales(db: Session = Depends(get_db)):
    return {"monthly_revenue": kpi_service.monthly_revenue(db)}


@router.get("/orders")
def orders(db: Session = Depends(get_db)):
    return {"by_status": kpi_service.orders_by_status(db)}


@router.get("/customers")
def customers():
    return {"status": "planned", "message": "Customer analytics (repeat rate, geography) pending"}


@router.get("/products")
def products(db: Session = Depends(get_db)):
    return {"revenue_by_category": kpi_service.revenue_by_category(db)}


@router.get("/sellers")
def sellers():
    return {"status": "planned", "message": "Seller analytics pending"}


@router.get("/delivery")
def delivery(db: Session = Depends(get_db)):
    return {"kpis": kpi_service.get_kpis(db)["kpis"]}
