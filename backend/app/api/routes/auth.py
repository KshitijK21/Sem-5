from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import get_current_user, require_roles
from app.core.security import create_access_token
from app.services import users as user_service

router = APIRouter()


def _public(user: dict) -> dict:
    return {"id": user["id"], "username": user["username"], "role": user["role"]}


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = user_service.authenticate(form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user["username"], user["role"])
    return {"access_token": token, "token_type": "bearer", "user": _public(user)}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"user": _public(user)}


@router.get("/admin/users")
def admin_users(user: dict = Depends(require_roles("admin"))):
    return {"users": [_public(u) for u in user_service.USERS.values()]}
