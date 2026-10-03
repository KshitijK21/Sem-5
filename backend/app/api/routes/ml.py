from fastapi import APIRouter

router = APIRouter()

FEATURES = [
  {"name": "sales_forecast", "status": "planned"},
  {"name": "sales_prediction", "status": "planned"},
  {"name": "customer_segmentation", "status": "planned"},
  {"name": "product_segmentation", "status": "planned"},
  {"name": "anomaly_detection", "status": "planned"},
]

@router.get("/status")
def ml_status():
    return {"features": FEATURES}
