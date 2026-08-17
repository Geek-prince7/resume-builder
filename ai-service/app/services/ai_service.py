import os
import json
import random
import time
import logging

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")  # "openai" or "gemini"
LOGGER = logging.getLogger(__name__)
LLM_RETRY_ATTEMPTS = int(os.getenv("LLM_RETRY_ATTEMPTS", "3"))
LLM_RETRY_BASE_DELAY_MS = int(os.getenv("LLM_RETRY_BASE_DELAY_MS", "250"))
LLM_RETRY_MAX_DELAY_MS = int(os.getenv("LLM_RETRY_MAX_DELAY_MS", "3000"))
LLM_RETRY_JITTER_MS = int(os.getenv("LLM_RETRY_JITTER_MS", "300"))
LLM_REQUEST_TIMEOUT_SECONDS = float(os.getenv("LLM_REQUEST_TIMEOUT_SECONDS", "45"))
LLM_MAX_OUTPUT_TOKENS = int(os.getenv("LLM_MAX_OUTPUT_TOKENS", "5000"))

MODEL_PRICING_PER_MILLION = {
    "gemini-3.1-pro-preview": (2.0, 12.0),
    "gemini-3.1-flash-lite": (0.25, 1.5),
    "gemini-3.5-flash-lite": (0.30, 2.5),
    "gpt-4o-mini": (0.15, 0.60),
    "gpt-4.1-mini": (0.40, 1.60),
}


def _usage(provider: str, model: str, input_tokens: int, output_tokens: int) -> dict:
    input_rate, output_rate = MODEL_PRICING_PER_MILLION.get(model, (0.0, 0.0))
    cost = (input_tokens * input_rate + output_tokens * output_rate) / 1_000_000
    return {
        "provider": provider,
        "model": model,
        "inputTokens": input_tokens,
        "outputTokens": output_tokens,
        "estimatedCostUsd": round(cost, 8),
    }

PARSE_SYSTEM_PROMPT = """You are an expert resume parser. Extract structured data from the resume text provided.
Return a JSON object with these fields (omit fields if not found):
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "totalExperience": { "years": number, "months": number },
  "linkedinUrl": "string",
  "githubUrl": "string",
  "behanceUrl": "string",
  "portfolioUrl": "string",
  "summary": "string (professional summary)",
  "experiences": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or null if current",
      "current": boolean,
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "grade": "string",
      "description": "string"
    }
  ],
  "skills": [
    { "name": "string", "level": "beginner|intermediate|advanced|expert", "category": "string" }
  ],
  "certifications": [
    { "name": "string", "issuer": "string", "date": "YYYY-MM-DD", "url": "string" }
  ],
  "projects": [
    { "name": "string", "description": "string", "url": "string", "technologies": ["string"] }
  ],
  "languages": [
    { "name": "string", "proficiency": "elementary|limited_working|professional_working|full_professional|native" }
  ],
  "achievements": ["string"]
}
Calculate totalExperience by summing up durations of all work experiences.
Return ONLY valid JSON, no markdown fences or extra text."""

GENERATE_SYSTEM_PROMPT = """You are an elite ATS-optimization expert and resume writer. Your goal is to produce a resume that achieves a 90-95% match score against the provided job description.

CRITICAL RULES FOR MAXIMUM TRUTHFUL JD MATCHING:
1. SKILL EVIDENCE: Include a skill in the resume only when it exists in the user's profile, experience, projects, certifications, or achievements. Never add a JD skill merely because it is adjacent or plausible. Put unverified JD requirements in `atsReport.missingSkills`, not in the resume.
2. KEYWORD ALIGNMENT: Mirror JD wording only where the user's supplied evidence supports it. Never invent qualifications, outcomes, tools, responsibilities, metrics, or years of experience.
3. SUMMARY: Write a professional summary that reads like a direct answer to the JD. Use the exact job title from the JD. Weave in the top 5-6 keywords/requirements from the JD naturally.
4. EXPERIENCE BULLETS: Rewrite bullets for clarity and relevance, but preserve factual meaning. Use metrics only when the original profile contains those metrics.
5. SPELLING AND GRAMMAR: Every sentence must be grammatically correct with accurate spelling.
6. REORDER SECTIONS: Put the most JD-relevant sections first. If skills are heavily emphasized in the JD, skills section should come right after summary.
7. PROJECT DESCRIPTIONS: Reframe project descriptions to highlight technologies and outcomes that match the JD.
8. NEVER FABRICATE DATA: Only include sections that exist in the user's profile. If the user has no education entries, do NOT add an education section. If the user has no certifications, do NOT add certifications. If the user has no projects, do NOT add projects. Never invent companies, degrees, institutions, or any factual data that is not present in the user profile.
9. DATES: All dates must be in "YYYY-MM" format (e.g. "2020-01", "2023-06"). Never include time or day components.
10. MATCH SCORE: Calculate the score honestly from evidenced requirements. Do not force it to 90-95. A lower truthful score is required when qualifications are missing.

Return a JSON object with:
{
  "content": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "linkedinUrl": "string",
    "githubUrl": "string",
    "portfolioUrl": "string",
    "summary": "tailored professional summary saturated with JD keywords",
    "experiences": [
      {
        "company": "string",
        "role": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "current": boolean,
        "highlights": ["JD-keyword-rich tailored bullet points with metrics"]
      }
    ],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "field": "string",
        "startDate": "string",
        "endDate": "string"
      }
    ],
    "skills": [
      { "name": "string", "category": "string" }
    ],
    "certifications": [{ "name": "string", "issuer": "string" }],
    "projects": [{ "name": "string", "description": "string", "technologies": ["string"] }]
    ,"awards": [{ "title": "string", "issuer": "string", "description": "string" }]
    ,"publications": [{ "title": "string", "publisher": "string", "description": "string" }]
    ,"volunteerWork": [{ "organization": "string", "role": "string", "highlights": ["string"] }]
    ,"patents": [{ "title": "string", "number": "string" }]
    ,"customSections": [{ "title": "string", "items": ["string"] }]
  },
  "score": number (0-100, honest evidenced match percentage),
  "atsReport": {
    "confirmedSkills": ["JD skills directly supported by profile evidence"],
    "missingSkills": ["JD skills not supported by the profile"],
    "matchedKeywords": ["matched JD keywords"],
    "missingKeywords": ["important unmatched JD keywords"],
    "strengths": ["evidence-backed strengths"],
    "recommendations": ["truthful steps the user can take; never suggest falsely claiming experience"]
  }
}
Return ONLY valid JSON, no markdown fences or extra text."""

COVER_LETTER_SYSTEM_PROMPT = """Write a concise, professional cover letter using only facts supplied in the user profile. Connect evidenced experience to the job description, acknowledge no unsupported skills, and never invent employers, metrics, education, or qualifications. Return JSON only: {"content": "the complete cover letter"}."""


# ---------------------------------------------------------------------------
# OpenAI provider
# ---------------------------------------------------------------------------

def _openai_call(system_prompt: str, user_prompt: str, temperature: float) -> dict:
    from openai import OpenAI

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        response_format={"type": "json_object"},
        max_tokens=LLM_MAX_OUTPUT_TOKENS,
        timeout=LLM_REQUEST_TIMEOUT_SECONDS,
    )
    return {
        "data": json.loads(response.choices[0].message.content),
        "usage": _usage("openai", model, response.usage.prompt_tokens, response.usage.completion_tokens),
    }


# ---------------------------------------------------------------------------
# Gemini provider
# ---------------------------------------------------------------------------

def _gemini_call(system_prompt: str, user_prompt: str, temperature: float) -> dict:
    from google import genai

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    response = client.models.generate_content(
        model=model,
        contents=f"{system_prompt}\n\n{user_prompt}",
        config=genai.types.GenerateContentConfig(
            temperature=temperature,
            response_mime_type="application/json",
            max_output_tokens=LLM_MAX_OUTPUT_TOKENS,
        ),
    )

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    metadata = response.usage_metadata
    input_tokens = int(getattr(metadata, "prompt_token_count", 0) or 0)
    output_tokens = int(
        (getattr(metadata, "candidates_token_count", 0) or 0)
        + (getattr(metadata, "thoughts_token_count", 0) or 0)
    )
    return {
        "data": json.loads(text),
        "usage": _usage("gemini", model, input_tokens, output_tokens),
    }


# ---------------------------------------------------------------------------
# Unified interface
# ---------------------------------------------------------------------------

def _retry_with_jitter(task):
    last_error = None
    for attempt in range(LLM_RETRY_ATTEMPTS + 1):
        try:
            return task()
        except Exception as exc:
            last_error = exc
            if attempt >= LLM_RETRY_ATTEMPTS:
                raise
            exp_backoff = min(LLM_RETRY_MAX_DELAY_MS, LLM_RETRY_BASE_DELAY_MS * (2**attempt))
            jitter = random.randint(0, LLM_RETRY_JITTER_MS)
            sleep_ms = exp_backoff + jitter
            LOGGER.warning(
                "LLM call failed, retrying",
                extra={"attempt": attempt + 1, "sleep_ms": sleep_ms, "error": str(exc)},
            )
            time.sleep(sleep_ms / 1000.0)
    raise last_error

def _call_llm(system_prompt: str, user_prompt: str, temperature: float = 0.2) -> dict:
    provider = AI_PROVIDER.lower()
    if provider == "gemini":
        return _retry_with_jitter(lambda: _gemini_call(system_prompt, user_prompt, temperature))
    elif provider == "openai":
        return _retry_with_jitter(lambda: _openai_call(system_prompt, user_prompt, temperature))
    else:
        raise ValueError(f"Unknown AI_PROVIDER: '{provider}'. Use 'openai' or 'gemini'.")


def parse_resume_text(resume_text: str) -> dict:
    return _call_llm(
        PARSE_SYSTEM_PROMPT,
        f"Parse this resume:\n\n{resume_text}",
        temperature=0.1,
    )


def generate_tailored_resume(user_profile: dict, job_description: str) -> dict:
    user_json = json.dumps(user_profile, indent=2, default=str)
    return _call_llm(
        GENERATE_SYSTEM_PROMPT,
        f"User Profile:\n{user_json}\n\nJob Description:\n{job_description}\n\nCreate a tailored resume for this job.",
        temperature=0.3,
    )


def generate_cover_letter(user_profile: dict, job_description: str) -> dict:
    return _call_llm(
        COVER_LETTER_SYSTEM_PROMPT,
        f"User Profile:\n{json.dumps(user_profile, indent=2, default=str)}\n\nJob Description:\n{job_description}",
        temperature=0.35,
    )
