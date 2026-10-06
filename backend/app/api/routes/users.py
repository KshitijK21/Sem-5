from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_user, require_roles
from app.services import users as user_service

router = APIRouter()


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=128)


class RoleChange(BaseModel):
    role: str = Field(..., pattern="^(analyst|admin)$")


@router.get("/me")
def read_me(user: dict = Depends(get_current_user)):
    return {"user": user}


@router.patch("/me")
def update_me(payload: PasswordChange, user: dict = Depends(get_current_user)):
    if not user_service.authenticate(user["username"], payload.current_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    user_service.update_password(user["username"], payload.new_password)
    return {"status": "password_updated"}


@router.put("/me")
def replace_me(payload: PasswordChange, user: dict = Depends(get_current_user)):
    return update_me(payload, user)


@router.get("")
def list_all(_: dict = Depends(require_roles("admin"))):
    return {"users": user_service.list_users()}


@router.patch("/{username}/role")
def set_role(username: str, payload: RoleChange, _: dict = Depends(require_roles("admin"))):
    try:
        updated = user_service.update_role(username, payload.role)
    except user_service.LastAdminError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"user": updated}
