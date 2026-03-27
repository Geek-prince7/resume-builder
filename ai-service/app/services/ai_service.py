import os
import json

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")  # "openai" or "gemini"

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

CRITICAL RULES FOR MAXIMUM JD MATCHING:
1. SKILLS MERGING: Include ALL skills, technologies, tools, and frameworks mentioned in the JD. Combine them with the user's existing skills. If the JD mentions a skill the user doesn't have but could reasonably claim (adjacent/related technology), add it. Categorize them to match JD terminology exactly.
2. KEYWORD SATURATION: Mirror the exact keywords, phrases, and terminology from the JD throughout the resume — in the summary, experience bullet points, skills section, and project descriptions. ATS systems do literal keyword matching.
3. SUMMARY: Write a professional summary that reads like a direct answer to the JD. Use the exact job title from the JD. Weave in the top 5-6 keywords/requirements from the JD naturally.
4. EXPERIENCE BULLETS: Rewrite every bullet point to incorporate JD keywords. Use strong action verbs + quantifiable metrics. Each role should address at least 2-3 JD requirements directly.
5. SPELLING AND GRAMMAR: Every sentence must be grammatically correct with accurate spelling.
6. REORDER SECTIONS: Put the most JD-relevant sections first. If skills are heavily emphasized in the JD, skills section should come right after summary.
7. PROJECT DESCRIPTIONS: Reframe project descriptions to highlight technologies and outcomes that match the JD.
8. NEVER FABRICATE DATA: Only include sections that exist in the user's profile. If the user has no education entries, do NOT add an education section. If the user has no certifications, do NOT add certifications. If the user has no projects, do NOT add projects. Never invent companies, degrees, institutions, or any factual data that is not present in the user profile.
9. DATES: All dates must be in "YYYY-MM" format (e.g. "2020-01", "2023-06"). Never include time or day components.
10. The score MUST reflect actual keyword coverage. Aim for 90-95.

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
  },
  "score": number (90-95, reflecting actual keyword match percentage against JD)
}
Return ONLY valid JSON, no markdown fences or extra text."""


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
    )
    return json.loads(response.choices[0].message.content)


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
        ),
    )

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    return json.loads(text)


# ---------------------------------------------------------------------------
# Unified interface
# ---------------------------------------------------------------------------

def _call_llm(system_prompt: str, user_prompt: str, temperature: float = 0.2) -> dict:
    provider = AI_PROVIDER.lower()
    if provider == "gemini":
        return _gemini_call(system_prompt, user_prompt, temperature)
    elif provider == "openai":
        return _openai_call(system_prompt, user_prompt, temperature)
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
