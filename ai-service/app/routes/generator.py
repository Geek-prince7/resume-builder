from fastapi import APIRouter, HTTPException
from app.schemas import GenerateRequest, GenerateResponse
from app.services.ai_service import generate_tailored_resume
from app.logging_config import get_logger
import os

router = APIRouter()
logger = get_logger(__name__)
MAX_JD_CHARS = int(os.getenv("MAX_JD_CHARS", "30000"))


@router.post("/generate-resume", response_model=GenerateResponse)
async def generate_resume(req: GenerateRequest):
    if not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")
    if len(req.job_description) > MAX_JD_CHARS:
        raise HTTPException(status_code=413, detail="Job description too large")

    logger.info(
        "Resume generation started",
        extra={"template_id": req.template_id},
    )
    result = generate_tailored_resume(req.user_profile, req.job_description)

    generated = result["data"]
    content = generated.get("content", generated)
    score = generated.get("score", 0)

    logger.info(
        "Resume generation completed",
        extra={"template_id": req.template_id, "score": score},
    )
    return GenerateResponse(
        content=content,
        score=score,
        ats_report=generated.get("atsReport", {}),
        usage=result["usage"],
    )
