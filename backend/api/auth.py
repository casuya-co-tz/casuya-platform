from fastapi import APIRouter, HTTPException

from backend.schemas.auth import AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest
from backend.services.auth_service import authenticate_user, refresh_access_token, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    try:
        return register_user(
            email=body.email,
            password=body.password,
            full_name=body.full_name,
            role=body.role,
            phone=body.phone,
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    try:
        return authenticate_user(email=body.email, password=body.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/refresh")
def refresh(body: RefreshTokenRequest):
    try:
        return refresh_access_token(body.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
