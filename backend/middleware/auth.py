import json

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from backend.config.database import get_db, redis_client
from backend.config.security import decode_access_token
from backend.config.settings import get_settings
from backend.models.user import User

settings = get_settings()


def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    # Dev-mode: accept tokens with a dev- prefix user_id without DB lookup
    if settings.environment == "development" and str(payload.get("sub", "")).startswith("dev-"):
        return payload
    try:
        db: Session = next(get_db())
        user = db.query(User).filter(User.id == payload["sub"]).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")
        return payload
    except HTTPException:
        raise
    except Exception:
        # DB unreachable in dev — trust the JWT signature
        if settings.environment == "development":
            return payload
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def optional_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ")
    try:
        return decode_access_token(token)
    except Exception:
        return None
