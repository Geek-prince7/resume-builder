# Resume Builder

AI-powered resume builder that tailors your resume to specific job descriptions.

## Architecture

- **backend/** — Node.js + Express API server (port 3001)
- **ai-service/** — Python FastAPI for resume parsing and AI generation (port 8000)
- **frontend/** — React + Vite + Tailwind UI (port 5173)
- **Database** — MongoDB (Docker service, no local install needed)

## Recommended: run everything with Docker

On a new machine you only need **Docker Desktop** (or Docker Engine + Compose).  
No local Node/Python/MongoDB install is required.

```bash
# 1) Clone repo
git clone <your-repo-url>
cd resume-builder

# 2) Create env files from examples
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
# Edit ai-service/.env and set GEMINI_API_KEY or OPENAI_API_KEY

# 3) Start all services (frontend + backend + AI + MongoDB)
docker compose up --build -d
# or: npm run docker:up

# 4) Open app
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001/api/health
# AI:       http://localhost:8000/health
```

Useful Docker commands:

```bash
npm run docker:ps      # status
npm run docker:logs    # live logs
npm run docker:down    # stop
npm run docker:reset   # wipe DB volume and recreate
```

If ports are already taken on that PC:

```bash
MONGODB_PORT=27018 AI_SERVICE_PORT=8001 BACKEND_PORT=3001 FRONTEND_PORT=5173 docker compose up --build -d
```

Notes:
- MongoDB data is stored in Docker volume `mongo-data` (persists across restarts).
- Inside Docker, backend always connects to `mongodb://mongodb:27017/resume-builder` (compose overrides host `.env` Mongo URI).

## Local Quick Start (without Docker)

```bash
# Requires: Node.js >= 18, Python >= 3.10, MongoDB running locally
npm run install:all

cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
# Edit keys in .env files

npm run dev
```

## Environments and Logging

Both backend and AI service support three environments:

- `dev` -> logs to console only
- `testapp` -> logs to AWS CloudWatch
- `prod` -> logs to AWS CloudWatch

Env files are provided in each service:

- `backend/.env.dev`, `backend/.env.testapp`, `backend/.env.prod`
- `ai-service/.env.dev`, `ai-service/.env.testapp`, `ai-service/.env.prod`

Required CloudWatch variables:

- `APP_ENV` (`dev`, `testapp`, `prod`)
- `AWS_REGION`
- `CLOUDWATCH_LOG_GROUP`
- `CLOUDWATCH_BACKEND_LOG_STREAM` (backend only)
- `CLOUDWATCH_AI_LOG_STREAM` (ai-service only)

Security controls enabled:

- Backend: `helmet`, request rate limiting, auth rate limiting, NoSQL sanitization, HTTP param pollution protection, compression, strict CORS origin allowlist.
- AI service: in-memory per-IP rate limiting for `/parse-resume` and `/generate-resume`, trusted host validation, secure response headers, request-size guards.
- AI/network resilience: retry with exponential backoff + jitter for outbound AI calls on both backend and AI service.

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React UI |
| Backend | http://localhost:3001 | REST API |
| AI Service | http://localhost:8000 | Resume parsing & generation |
| MongoDB | mongodb://localhost:27017 | Database |
