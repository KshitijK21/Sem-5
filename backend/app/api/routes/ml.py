"""ML inference endpoints.

Every route loads a trained artifact, builds features from the live warehouse
and returns real model output. Errors are honest:

- 400 invalid query value (periods out of range)
- 401/403 authentication/authorization (router-level)
- 409 invalid model/data state (insufficient history, empty warehouse)
- 422 validation error (bad target/date parameters, bad payload)
- 503 artifact missing / not loadable
- 500 unexpected inference failure (logged, generic detail)
"""

import logging
from contextlib import contextmanager
from datetime import datetime
from typing import Callable, Iterator

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import ml as ml_service
from app.services.ml_features import MlDataError

logger = logging.getLogger("app.ml")

router = APIRouter()

FORECAST_TARGETS = ("orders", "revenue")


class SalesPredictRequest(BaseModel):
    purchase_month: int = Field(..., ge=1, le=12)
    purchase_weekday: int = Field(..., ge=0, le=6)
    purchase_hour: int = Field(..., ge=0, le=23)
    n_items: int = Field(..., ge=1, le=100)
    customer_state: str = Field(..., min_length=2, max_length=2)
    product_category_name: str = Field(..., min_length=1, max_length=100)


@contextmanager
def _session() -> Iterator:
    from app.database.session import SessionLocal

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _serve(call: Callable[[], dict]) -> dict:
    """Run an inference call and map failures to honest HTTP errors."""
    try:
        return call()
    except MlDataError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (FileNotFoundError, ml_service.ArtifactError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001 - surface as 500 with a safe message
        logger.exception("ml: inference failed")
        raise HTTPException(
            status_code=500,
            detail=f"model inference failed ({type(exc).__name__}) - see server logs",
        ) from exc


def _date_range(date_from: str | None, date_to: str | None) -> tuple[str | None, str | None]:
    for label, value in (("date_from", date_from), ("date_to", date_to)):
        if value is not None:
            try:
                datetime.strptime(value, "%Y-%m-%d")
            except ValueError as exc:
                raise HTTPException(
                    status_code=422,
                    detail=f"{label} must be a valid YYYY-MM-DD date",
                ) from exc
    if date_from and date_to and date_from > date_to:
        raise HTTPException(
            status_code=422, detail="date_from must be on or before date_to"
        )
    return date_from, date_to


@router.get("/status")
def ml_status():
    return {"features": ml_service.feature_status()}


@router.get("/models/{name}")
def ml_model_detail(name: str):
    meta = ml_service.load_all_metadata().get(name)
    if not meta:
        raise HTTPException(status_code=404, detail=f"model '{name}' not found")
    return {**meta, "serving": ml_service.model_state(name)}


@router.get("/forecast")
def ml_forecast(
    periods: int = 30,
    target: str = "orders",
    date_from: str | None = None,
    date_to: str | None = None,
):
    """Recursive daily forecast for orders or revenue (real model.predict)."""
    if not (1 <= periods <= 90):
        raise HTTPException(status_code=400, detail="periods must be between 1 and 90")
    if target not in FORECAST_TARGETS:
        raise HTTPException(
            status_code=422,
            detail=f"target must be one of: {', '.join(FORECAST_TARGETS)}",
        )
    date_from, date_to = _date_range(date_from, date_to)
    with _session() as db:
        return _serve(
            lambda: ml_service.forecast(
                db, periods=periods, target=target, date_from=date_from, date_to=date_to
            )
        )


@router.get("/segments/customers")
def ml_customer_segments(date_from: str | None = None, date_to: str | None = None):
    """Live K-Means customer segmentation over warehouse RFM features."""
    date_from, date_to = _date_range(date_from, date_to)
    with _session() as db:
        return _serve(lambda: ml_service.customer_segments(db, date_from, date_to))


@router.get("/segments/products")
def ml_product_segments(date_from: str | None = None, date_to: str | None = None):
    """Live K-Means product segmentation over warehouse product features."""
    date_from, date_to = _date_range(date_from, date_to)
    with _session() as db:
        return _serve(lambda: ml_service.product_segments(db, date_from, date_to))


@router.get("/anomalies")
def ml_anomalies(date_from: str | None = None, date_to: str | None = None):
    """Live Isolation Forest scoring of the daily orders/revenue series."""
    date_from, date_to = _date_range(date_from, date_to)
    with _session() as db:
        return _serve(lambda: ml_service.anomalies(db, date_from, date_to))


@router.post("/predict/sales")
def ml_predict_sales(payload: SalesPredictRequest):
    return _serve(lambda: ml_service.predict_sales(payload.model_dump()))
