# Resume Builder

AI-powered resume builder that tailors your resume to specific job descriptions.

## Architecture

- **backend/** — Node.js + Express API server (port 3001)
- **ai-service/** — Python FastAPI for resume parsing and AI generation (port 8000)
- **frontend/** — React + Vite + Tailwind UI (port 5173)
- **Database** — MongoDB (local, port 27017)

## Prerequisites

- Node.js >= 18
- Python >= 3.10
- MongoDB running locally on port 27017
- OpenAI API key

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Copy environment files
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
# Edit .env files and add your OPENAI_API_KEY

# Start all services
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
