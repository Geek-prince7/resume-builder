from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.file_parser import extract_text
from app.services.ai_service import parse_resume_text
from app.logging_config import get_logger
import os

router = APIRouter()
logger = get_logger(__name__)
MAX_RESUME_FILE_SIZE_BYTES = int(os.getenv("MAX_RESUME_FILE_SIZE_BYTES", str(5 * 1024 * 1024)))
MAX_RESUME_TEXT_CHARS = int(os.getenv("MAX_RESUME_TEXT_CHARS", "120000"))


@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    allowed = (".pdf", ".docx")
    if not file.filename.lower().endswith(allowed):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_RESUME_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File too large")
    logger.info(
        "Resume parse started",
        extra={"filename": file.filename, "size_bytes": len(file_bytes)},
    )

    try:
        text = extract_text(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")
    if len(text) > MAX_RESUME_TEXT_CHARS:
        text = text[:MAX_RESUME_TEXT_CHARS]

    parsed = parse_resume_text(text)
    logger.info("Resume parse completed", extra={"filename": file.filename})
    return parsed
