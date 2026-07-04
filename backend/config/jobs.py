"""Redis Queue (RQ) configuration for background jobs."""

from redis import Redis
from rq import Queue

from backend.config.settings import get_settings

settings = get_settings()

redis_conn = Redis.from_url(settings.redis_url)

default_queue = Queue("default", connection=redis_conn)
high_queue = Queue("high", connection=redis_conn)
low_queue = Queue("low", connection=redis_conn)


def enqueue_job(queue_name: str, func: str, *args, **kwargs):
    queues = {"default": default_queue, "high": high_queue, "low": low_queue}
    queue = queues.get(queue_name, default_queue)
    return queue.enqueue(func, *args, **kwargs)
