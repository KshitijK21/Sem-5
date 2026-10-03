from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import ml as ml_service

router = APIRouter()


class SalesPredictRequest(BaseModel):
    purchase_month: int = Field(..., ge=1, le=12)
    purchase_weekday: int = Field(..., ge=0, le=6)
    purchase_hour: int = Field(..., ge=0, le=23)
    n_items: int = Field(..., ge=1)
    customer_state: str = "SP"
    product_category_name: str = "unknown"


@router.get("/status")
def ml_status():
    return {"features": ml_service.feature_status()}


@router.get("/models/{name}")
def ml_model_detail(name: str):
    meta = ml_service.load_all_metadata().get(name)
    if not meta:
        raise HTTPException(status_code=404, detail=f"model '{name}' not found")
    return meta


@router.get("/forecast")
def ml_forecast(periods: int = 30):
    if not (1 <= periods <= 90):
        raise HTTPException(status_code=400, detail="periods must be between 1 and 90")
    try:
        return ml_service.forecast(periods)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/segments/customers")
def ml_customer_segments():
    return ml_service.customer_segments()


@router.get("/anomalies")
def ml_anomalies():
    return ml_service.anomalies()


@router.post("/predict/sales")
def ml_predict_sales(payload: SalesPredictRequest):
    try:
        return ml_service.predict_sales(payload.model_dump())
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
