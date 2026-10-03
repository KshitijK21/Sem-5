from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

router = APIRouter()

def require_roles(*roles):
    def checker():
        # Placeholder auth/deps - enforce later
        return True
    return checker

@router.get("/me")
def me():
    return {"user": {"id": 1, "role": "admin"}, "status": "stub"}

@router.get("/admin/users")
def admin_users(_: bool = Depends(lambda: True)):
    return {"users": [], "status": "stub"}
