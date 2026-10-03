from fastapi import APIRouter

router = APIRouter()

@router.get("/kpis")
def kpis():
    # Placeholder; return honest status until real ETL/data wired
    return {"status": "placeholder", "message": "KPIs will be computed from Olist after ETL", "data": {}}
