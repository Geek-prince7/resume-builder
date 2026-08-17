# Deployment runbook

## Production topology

Run the frontend as static assets behind a CDN, the Node API and Python AI service as separate containers, MongoDB as a managed replica set, and Redis as a managed cache. The worker is started by the Node API and consumes BullMQ jobs from Redis. Do not expose MongoDB or Redis publicly.

Recommended AWS mapping:

- Frontend: S3 + CloudFront
- Backend and AI service: ECS Fargate behind an Application Load Balancer
- MongoDB: MongoDB Atlas with private networking
- Redis: ElastiCache for Redis
- Secrets: Secrets Manager injected into ECS tasks
- Logs and alarms: CloudWatch Logs, Metrics, and Alarms

## Environment promotion

- `dev`: local Docker Compose, console logging, test Stripe keys, mock or low-cost AI model.
- `testapp`: isolated cloud database/cache, CloudWatch logging, Stripe test mode, non-production OAuth callback.
- `prod`: production database/cache, CloudWatch logging, Stripe live mode, verified SMTP domain, production OAuth callback.

Keep separate secrets for every environment. Never commit `.env` files. Rotate `JWT_SECRET`, provider keys, Stripe keys, SMTP credentials, and AWS credentials when an environment is created or access changes.

## Required production configuration

Backend: `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, Stripe secret/price/webhook values, Google client ID, and SMTP values.

AI service: `AI_PROVIDER`, `AI_FALLBACK_PROVIDER`, the selected provider keys/models, `PROMPT_VERSION`, allowed origins/hosts, and AWS log values.

Frontend build: API origin, Google client ID, and optional AdSense publisher/slot IDs. Secret provider and Stripe keys belong only in backend or AI-service configuration.

## Release sequence

1. Run backend, frontend, and AI unit tests.
2. Build all three images with `docker compose build`.
3. Run the Playwright smoke flow with `AI_PROVIDER=mock`.
4. Deploy database-compatible backend/worker and AI images.
5. Verify `/api/health`, `/health`, `/api/metrics`, Redis connectivity, and queue processing.
6. Deploy frontend assets and invalidate the CDN cache.
7. Send a Stripe test webhook and perform one canary generation and PDF export.

## Monitoring and alarms

Alert on API/AI 5xx rate, p95 latency, queue depth/oldest job age, failed generation count, MongoDB connection failures, Redis errors, Stripe webhook failures, provider fallback rate, token spend, and container CPU/memory. Avoid logging resume text, passwords, tokens, API keys, or payment data.

## Backup and recovery

Enable continuous MongoDB backups with point-in-time recovery. Test restoration into a non-production project quarterly. Redis contains queue state and is not the source of truth; configure persistence for operational recovery but rely on MongoDB records for durable application state.

