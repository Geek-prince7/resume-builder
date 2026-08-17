from fastapi import APIRouter, HTTPException
from app.schemas import CoverLetterRequest, CoverLetterResponse
from app.services.ai_service import generate_cover_letter
import asyncio

router = APIRouter()


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
async def create_cover_letter(req: CoverLetterRequest):
    if not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")
    result = await asyncio.to_thread(
        generate_cover_letter, req.user_profile, req.job_description
    )
    return CoverLetterResponse(content=result["data"].get("content", ""), usage=result["usage"])
