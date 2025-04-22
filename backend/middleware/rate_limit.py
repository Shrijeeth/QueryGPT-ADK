from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
from infra.redis import redis_client

RATE_LIMIT = 5  # max requests
RATE_PERIOD = 60  # per 60 seconds


def get_remote_ip(request: Request):
    # X-Forwarded-For support for proxy setups
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = get_remote_ip(request)
        key = f"rate_limit:{ip}"
        now = int(time.time())
        # Remove old timestamps and check current count atomically
        async with redis_client.pipeline(transaction=True) as pipe:
            # Remove timestamps older than RATE_PERIOD
            min_time = now - RATE_PERIOD
            await pipe.zremrangebyscore(key, 0, min_time)
            await pipe.zcard(key)
            results = await pipe.execute()
            count = results[1]
            if count >= RATE_LIMIT:
                return Response(
                    content="Too Many Requests",
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                )
            # Add current timestamp
            await redis_client.zadd(key, {str(now): now})
            await redis_client.expire(key, RATE_PERIOD)
        return await call_next(request)
