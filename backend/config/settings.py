"""Application settings, loaded from environment variables (.env in dev)."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Casuya Platform"
    environment: str = "development"  # development | staging | production
    debug: bool = True

    database_url: str = "postgresql://postgres:postgres@localhost:5432/casuya_platform"
    redis_url: str = "redis://localhost:6379"

    jwt_secret: str = "insecure-development-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:8000"]

    casuya_core_signing_key: str | None = None
    casuya_bridge_shared_key: str | None = None
    supabase_url: str | None = None
    supabase_key: str | None = None
    cloudflare_zone_id: str | None = None
    cloudflare_api_token: str | None = None
    azampay_client_id: str | None = None
    azampay_client_secret: str | None = None
    africastalking_username: str | None = None
    africastalking_api_key: str | None = None

    sentry_dsn: str | None = None

    storage_root: str = "./storage"
    rate_limit_per_minute: int = 120


@lru_cache
def get_settings() -> Settings:
    return Settings()
