import json
import time

from starlette.types import ASGIApp, Receive, Scope, Send


ENDPOINT_LIMITS = {
    "/auth/register": 5,
    "/auth/login": 10,
    "/auth/refresh": 10,
    "/payments/checkout": 10,
    "/payments/webhook": 30,
}

EXEMPT_PATHS = {"/health", "/readyz"}


class RateLimitMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        method = scope.get("method", "")
        path = scope.get("path", "")

        if method in {"OPTIONS", "HEAD"} or path in EXEMPT_PATHS:
            await self.app(scope, receive, send)
            return

        from backend.config.settings import get_settings

        settings = get_settings()
        client = scope.get("client")
        client_ip = client[0] if client else "unknown"
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
                body = json.dumps({"detail": f"Rate limit exceeded. Try again in {ttl} seconds."}).encode()
                await send({
                    "type": "http.response.start",
                    "status": 429,
                    "headers": [
                        [b"content-type", b"application/json"],
                        [b"content-length", str(len(body)).encode()],
                    ],
                })
                await send({"type": "http.response.body", "body": body})
                return

            redis_client.zadd(redis_key, {str(now): now})
            redis_client.expire(redis_key, 60)
        except Exception:
            pass

        await self.app(scope, receive, send)
