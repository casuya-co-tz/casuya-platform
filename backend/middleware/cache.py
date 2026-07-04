import json
import time

from backend.config.database import redis_client


def cache_get(key: str, ttl_seconds: int = 60):
    try:
        value = redis_client.get(key)
        if value is None:
            return None
        data = json.loads(value.decode("utf-8"))
        timestamp, actual_value = data[0], data[1]
        if time.time() - timestamp > ttl_seconds:
            redis_client.delete(key)
            return None
        return actual_value
    except Exception:
        return None


def cache_set(key: str, value: object):
    try:
        cache_invalidate()
        data = [time.time(), value]
        redis_client.setex(key, 60, json.dumps(data).encode("utf-8"))
    except Exception:
        pass


def cache_invalidate(pattern: str | None = None):
    if pattern is None:
        redis_client.flushdb()
    else:
        keys = redis_client.keys(f"*{pattern}*")
        if keys:
            redis_client.delete(*keys)
