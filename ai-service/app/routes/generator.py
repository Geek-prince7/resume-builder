from fastapi import APIRouter, HTTPException
from app.schemas import GenerateRequest, GenerateResponse
from app.services.ai_service import generate_tailored_resume
from app.services.template_renderer import render_template

router = APIRouter()


@router.post("/generate-resume", response_model=GenerateResponse)
async def generate_resume(req: GenerateRequest):
    if not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")

    result = generate_tailored_resume(req.user_profile, req.job_description)

    content = result.get("content", result)
    score = result.get("score", 0)

    html_content = render_template(content, req.template_id)

    return GenerateResponse(
        content=content,
        html_content=html_content,
        score=score,
    )
