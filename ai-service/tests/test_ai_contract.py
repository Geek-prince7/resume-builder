from app.services.ai_service import GENERATE_SYSTEM_PROMPT, _usage


def test_truthful_prompt_forbids_unsupported_skills():
    assert "Never add a JD skill" in GENERATE_SYSTEM_PROMPT
    assert "missingSkills" in GENERATE_SYSTEM_PROMPT
    assert "Do not force it to 90-95" in GENERATE_SYSTEM_PROMPT


def test_cost_estimate_uses_model_rates():
    usage = _usage("gemini", "gemini-3.1-pro-preview", 10_000, 3_000)
    assert usage["estimatedCostUsd"] == 0.056
