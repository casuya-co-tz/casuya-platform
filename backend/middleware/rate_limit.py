import json
import time

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware

from backend.config.database import redis_client
from backend.config.settings import get_settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        settings = get_settings()
        key = request.client.host if request.client else "unknown"
        redis_key = f"rate_limit:{key}"
        now = time.time()
        window_start = now - 60
        
        # Remove hits older than current window
        redis_client.zremrangebyscore(redis_key, 0, window_start)
        
        # Get current hits count
        hits = redis_client.zcard(redis_key)
        
        if hits >= settings.rate_limit_per_minute:
            ttl = int(redis_client.ttl(redis_key))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in {ttl} seconds."
            )
        
        # Add current hit
        redis_client.zadd(redis_key, {str(now): now})
        redis_client.expire(redis_key, 60)
        
        return await call_next(request)
