"""OAuth login / registration endpoints for Google and Facebook.

Flow:
  1. Frontend opens GET /auth/oauth/{provider} → returns { url } (authorization URL).
  2. User authenticates with the provider.
  3. Provider redirects to GET /auth/callback/{provider}?code=…&state=…
  4. Backend exchanges code for user info, creates/finds local user, redirects
     to the frontend with JWT tokens in the URL fragment.
"""

from __future__ import annotations

import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse

from backend.config.settings import get_settings
from backend.services.auth_service import oauth_login_or_register

router = APIRouter(prefix="/auth", tags=["oauth"])
settings = get_settings()

# ── Provider configurations ──────────────────────────────────────────────

PROVIDERS: dict[str, dict] = {
    "google": {
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "userinfo_url": "https://www.googleapis.com/oauth2/v3/userinfo",
        "client_id_env": "google_client_id",
        "client_secret_env": "google_client_secret",
        "scope": "openid email profile",
        "get_user_info": lambda data: {
            "email": data["email"],
            "full_name": data.get("name", ""),
            "avatar": data.get("picture", ""),
        },
    },
    "facebook": {
        "authorize_url": "https://www.facebook.com/v19.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v19.0/oauth/access_token",
        "userinfo_url": "https://graph.facebook.com/me?fields=id,name,email",
        "client_id_env": "facebook_client_id",
        "client_secret_env": "facebook_client_secret",
        "scope": "email public_profile",
        "get_user_info": lambda data: {
            "email": data["email"],
            "full_name": data.get("name", ""),
            "avatar": "",
        },
    },
}


def _get_client_id(provider: str) -> str:
    cfg = PROVIDERS[provider]
    val = getattr(settings, cfg["client_id_env"], None)
    if not val:
        raise HTTPException(status_code=503, detail=f"{provider.title()} OAuth is not configured")
    return val


def _get_client_secret(provider: str) -> str:
    cfg = PROVIDERS[provider]
    val = getattr(settings, cfg["client_secret_env"], None)
    if not val:
        raise HTTPException(status_code=503, detail=f"{provider.title()} OAuth is not configured")
    return val


def _callback_url(provider: str) -> str:
    return f"{settings.oauth_redirect_base}/auth/callback/{provider}"


# ── Step 1: Redirect to the authorization URL ────────────────────────────

@router.get("/oauth/{provider}")
def oauth_initiate(provider: str):
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    client_id = _get_client_id(provider)
    cfg = PROVIDERS[provider]
    state = secrets.token_urlsafe(16)

    params = {
        "client_id": client_id,
        "redirect_uri": _callback_url(provider),
        "response_type": "code",
        "scope": cfg["scope"],
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }
    # Facebook doesn't use access_type/prompt
    if provider == "facebook":
        params.pop("access_type", None)
        params.pop("prompt", None)

    url = f"{cfg['authorize_url']}?{urlencode(params)}"
    return RedirectResponse(url)


# ── Step 2: Handle the callback, exchange code, create/find user ─────────

@router.get("/callback/{provider}")
def oauth_callback(provider: str, request: Request):
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    code = request.query_params.get("code")
    if not code:
        return RedirectResponse(f"{settings.oauth_redirect_base}/login.html?error=no_code")

    cfg = PROVIDERS[provider]
    client_id = _get_client_id(provider)
    client_secret = _get_client_secret(provider)

    # Exchange authorization code for tokens
    try:
        token_resp = httpx.post(
            cfg["token_url"],
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": _callback_url(provider),
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        token_resp.raise_for_status()
        token_data = token_resp.json()
    except Exception:
        return RedirectResponse(f"{settings.oauth_redirect_base}/login.html?error=token_exchange_failed")

    access_token = token_data.get("access_token")
    if not access_token:
        return RedirectResponse(f"{settings.oauth_redirect_base}/login.html?error=no_access_token")

    # Fetch user info
    try:
        userinfo_resp = httpx.get(
            cfg["userinfo_url"],
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()
    except Exception:
        return RedirectResponse(f"{settings.oauth_redirect_base}/login.html?error=userinfo_failed")

    user_info = cfg["get_user_info"](userinfo)
    if not user_info.get("email"):
        return RedirectResponse(f"{settings.oauth_redirect_base}/login.html?error=no_email")

    # Create or find user, get JWT tokens
    try:
        result = oauth_login_or_register(
            provider=provider,
            provider_user_id=str(userinfo.get("id", "")),
            email=user_info["email"],
            full_name=user_info["full_name"],
            avatar=user_info.get("avatar", ""),
        )
    except Exception:
        return RedirectResponse(f"{settings.oauth_redirect_base}/login.html?error=account_creation_failed")

    # Redirect to frontend with tokens in the URL fragment
    fragment = urlencode({
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "role": result["role"],
        "user_id": result["user_id"],
    })
    return RedirectResponse(f"{settings.oauth_redirect_base}/login.html?oauth=success#{fragment}")
