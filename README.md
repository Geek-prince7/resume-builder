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

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React UI |
| Backend | http://localhost:3001 | REST API |
| AI Service | http://localhost:8000 | Resume parsing & generation |
| MongoDB | mongodb://localhost:27017 | Database |
