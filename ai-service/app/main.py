from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routes import parser, generator

app = FastAPI(title="Resume Builder AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parser.router)
app.include_router(generator.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "resume-builder-ai-service"}
