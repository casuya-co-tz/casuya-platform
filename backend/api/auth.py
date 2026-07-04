from fastapi import APIRouter, HTTPException

from backend.schemas.auth import AuthResponse, LoginRequest, RefreshRequest, RegisterRequest
from backend.services.auth_service import authenticate_user, register_user

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
def refresh(body: RefreshRequest):
    from backend.config.security import decode_access_token

    try:
        payload = decode_access_token(body.token)
        return {"access_token": body.token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
