from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from time import perf_counter
import os
import time
import uuid
from collections import defaultdict, deque
from starlette.middleware.trustedhost import TrustedHostMiddleware

load_dotenv()

from app.routes import parser, generator, cover_letter
from app.logging_config import setup_logging, get_logger, APP_ENV

setup_logging()
logger = get_logger(__name__)

app = FastAPI(title="Resume Builder AI Service", version="1.0.0")

ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = ["*"] if ALLOWED_ORIGINS.strip() == "*" else [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]
TRUSTED_HOSTS = os.getenv("TRUSTED_HOSTS", "localhost,127.0.0.1")
trusted_hosts = [h.strip() for h in TRUSTED_HOSTS.split(",") if h.strip()]

RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("AI_RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("AI_RATE_LIMIT_MAX_REQUESTS", "30"))
rate_limit_buckets: dict[str, deque] = defaultdict(deque)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

app.include_router(parser.router)
app.include_router(generator.router)
app.include_router(cover_letter.router)


@app.middleware("http")
async def log_requests(request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    # Basic in-memory rate limiter for expensive AI endpoints.
    if request.url.path in ("/parse-resume", "/generate-resume"):
        ip = request.client.host if request.client else "unknown"
        key = f"{ip}:{request.url.path}"
        now = time.time()
        bucket = rate_limit_buckets[key]
        while bucket and now - bucket[0] > RATE_LIMIT_WINDOW_SECONDS:
            bucket.popleft()
        if len(bucket) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please retry later."},
            )
        bucket.append(now)

    start = perf_counter()
    response = await call_next(request)
    duration_ms = round((perf_counter() - start) * 1000, 2)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Request-Id"] = request_id
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-RateLimit-Window"] = str(RATE_LIMIT_WINDOW_SECONDS)
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_MAX_REQUESTS)
    logger.info(
        "HTTP request completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "request_id": request_id,
        },
    )
    return response


@app.get("/health")
def health():
    logger.info("Health endpoint called", extra={"env": APP_ENV})
    return {"status": "ok", "service": "resume-builder-ai-service"}
