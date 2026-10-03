from fastapi import APIRouter

router = APIRouter()

@router.get("/sales")
def sales():
    return {"status": "placeholder", "message": "Sales analytics from Olist (post-ETL)"}

@router.get("/orders")
def orders():
    return {"status": "placeholder"}

@router.get("/customers")
def customers():
    return {"status": "placeholder"}

@router.get("/products")
def products():
    return {"status": "placeholder"}

@router.get("/sellers")
def sellers():
    return {"status": "placeholder"}

@router.get("/delivery")
def delivery():
    return {"status": "placeholder"}
