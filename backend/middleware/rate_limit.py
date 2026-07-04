import time

from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from backend.config.settings import get_settings

ENDPOINT_LIMITS = {
    "/auth/register": 5,
    "/auth/login": 10,
    "/auth/refresh": 10,
    "/payments/checkout": 10,
    "/payments/webhook": 30,
}

EXEMPT_PATHS = {"/health", "/readyz"}


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in {"OPTIONS", "HEAD"} or request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        settings = get_settings()
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        limit = ENDPOINT_LIMITS.get(path, settings.rate_limit_per_minute)
        redis_key = f"rate_limit:{client_ip}:{path}"
        now = time.time()
        window_start = now - 60

        try:
            from backend.config.database import redis_client

            redis_client.zremrangebyscore(redis_key, 0, window_start)
            hits = redis_client.zcard(redis_key)

            if hits >= limit:
                ttl = int(redis_client.ttl(redis_key))
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": f"Rate limit exceeded. Try again in {ttl} seconds."},
                )

            redis_client.zadd(redis_key, {str(now): now})
            redis_client.expire(redis_key, 60)
        except Exception:
            pass

        return await call_next(request)
