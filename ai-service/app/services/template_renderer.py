def _esc(val: str | None) -> str:
    if not val:
        return ""
    return val.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _fmt_date(d: str | None) -> str:
    if not d:
        return ""
    d = d.strip()
    from datetime import datetime
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%Y-%m"):
        try:
            dt = datetime.strptime(d, fmt)
            return dt.strftime("%b %Y")
        except ValueError:
            continue
    if len(d) == 4 and d.isdigit():
        return d
    return d


def _section_experiences(exps: list[dict]) -> str:
    if not exps:
        return ""
    items = ""
    for exp in exps:
        end = "Present" if exp.get("current") else _fmt_date(exp.get("endDate", ""))
        highlights = "".join(f"<li>{h}</li>" for h in exp.get("highlights", []))
        location = exp.get("location", "")
        items += f"""
        <div class="entry">
            <div class="entry-header">
                <div class="entry-title">
                    <strong>{exp.get('role', '')}</strong>
                    <span class="company">{exp.get('company', '')}</span>
                </div>
                <div class="entry-meta">
                    <span class="date">{_fmt_date(exp.get('startDate', ''))} – {end}</span>
                    {f'<span class="location">{location}</span>' if location else ''}
                </div>
            </div>
            {f'<ul>{highlights}</ul>' if highlights else ''}
        </div>"""
    return f'<section><h2>Experience</h2>{items}</section>'


def _section_education(edus: list[dict]) -> str:
    if not edus:
        return ""
    items = ""
    for edu in edus:
        field_str = f" in {edu.get('field', '')}" if edu.get("field") else ""
        items += f"""
        <div class="entry">
            <div class="entry-header">
                <div class="entry-title">
                    <strong>{edu.get('degree', '')}{field_str}</strong>
                    <span class="company">{edu.get('institution', '')}</span>
                </div>
                <div class="entry-meta">
                    <span class="date">{_fmt_date(edu.get('startDate', ''))} – {_fmt_date(edu.get('endDate', ''))}</span>
                </div>
            </div>
        </div>"""
    return f'<section><h2>Education</h2>{items}</section>'


def _section_skills(skills: list[dict]) -> str:
    if not skills:
        return ""
    grouped: dict[str, list[str]] = {}
    for s in skills:
        cat = s.get("category", "Other") or "Other"
        grouped.setdefault(cat, []).append(s.get("name", ""))
    parts = ""
    for cat, names in grouped.items():
        pills = "".join(f'<span class="skill-pill">{n}</span>' for n in names)
        parts += f'<div class="skill-group"><span class="skill-cat">{cat}</span><div class="skill-list">{pills}</div></div>'
    return f'<section><h2>Skills</h2><div class="skills-container">{parts}</div></section>'


def _section_projects(projects: list[dict]) -> str:
    if not projects:
        return ""
    items = ""
    for p in projects:
        techs = ""
        if p.get("technologies"):
            tech_pills = "".join(f'<span class="tech-pill">{t}</span>' for t in p["technologies"])
            techs = f'<div class="tech-list">{tech_pills}</div>'
        items += f"""
        <div class="entry">
            <strong>{p.get('name', '')}</strong>
            {f'<p>{p.get("description", "")}</p>' if p.get("description") else ''}
            {techs}
        </div>"""
    return f'<section><h2>Projects</h2>{items}</section>'


def _section_certifications(certs: list[dict]) -> str:
    if not certs:
        return ""
    parts = []
    for c in certs:
        name = c.get("name", "")
        issuer = c.get("issuer", "")
        suffix = f'<span class="cert-issuer"> — {issuer}</span>' if issuer else ""
        parts.append(f"<li>{name}{suffix}</li>")
    items = "".join(parts)
    return f'<section><h2>Certifications</h2><ul class="cert-list">{items}</ul></section>'


# ---------------------------------------------------------------------------
# Google Fonts import used by all templates
# ---------------------------------------------------------------------------
FONTS_IMPORT = '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Source+Sans+3:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap");'

# ---------------------------------------------------------------------------
# Shared base CSS (reset + layout utilities)
# ---------------------------------------------------------------------------
BASE_CSS = """
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
a { text-decoration: none; }
ul { list-style: none; }
.entry { margin-bottom: 16px; }
.entry-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 4px; }
.entry-title { display: flex; flex-direction: column; }
.entry-meta { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.company { font-size: 0.9em; }
.skills-container { display: flex; flex-direction: column; gap: 10px; }
.skill-group { display: flex; align-items: flex-start; gap: 8px; }
.skill-cat { font-weight: 600; font-size: 0.85em; min-width: 100px; padding-top: 4px; }
.skill-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tech-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
"""

# ---------------------------------------------------------------------------
# Template: Classic
# ---------------------------------------------------------------------------
CLASSIC_CSS = FONTS_IMPORT + BASE_CSS + """
body { font-family: 'Merriweather', Georgia, serif; max-width: 800px; margin: 0 auto; padding: 48px 40px; color: #2c2c2c; line-height: 1.65; font-size: 13.5px; }
h1 { font-size: 26px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; margin-bottom: 6px; }
.contact { color: #5a5a5a; font-size: 12.5px; margin-bottom: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 16px; font-family: 'Inter', sans-serif; }
.contact a { color: #5a5a5a; }
.contact a:hover { color: #1a1a1a; }
h2 { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2.5px; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 6px; margin: 28px 0 16px; }
.entry-title strong { font-size: 14px; }
.company { color: #555; font-style: italic; }
.date { font-family: 'Inter', sans-serif; font-size: 12px; color: #777; white-space: nowrap; }
.location { font-family: 'Inter', sans-serif; font-size: 11px; color: #999; }
ul { padding-left: 18px; list-style: disc; }
li { margin-bottom: 4px; font-size: 13px; line-height: 1.55; color: #3a3a3a; }
p { margin: 4px 0; font-size: 13px; color: #3a3a3a; }
.summary { font-style: italic; margin-bottom: 20px; font-size: 13.5px; color: #444; line-height: 1.7; }
.skill-pill { background: #f5f5f5; border: 1px solid #ddd; padding: 3px 10px; border-radius: 3px; font-size: 12px; font-family: 'Inter', sans-serif; }
.tech-pill { font-size: 11px; color: #666; font-family: 'Inter', sans-serif; background: #f9f9f9; padding: 2px 8px; border-radius: 3px; }
.cert-list { padding-left: 18px; list-style: disc; }
.cert-list li { font-size: 13px; }
.cert-issuer { color: #777; font-size: 12px; }
"""

# ---------------------------------------------------------------------------
# Template: Modern
# ---------------------------------------------------------------------------
MODERN_CSS = FONTS_IMPORT + BASE_CSS + """
body { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; max-width: 820px; margin: 0 auto; padding: 44px 40px; color: #1e293b; line-height: 1.6; font-size: 13.5px; }
h1 { font-size: 30px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
.contact { font-size: 12.5px; color: #64748b; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 3px solid #3b82f6; }
.contact a { color: #3b82f6; font-weight: 500; }
h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #3b82f6; margin: 30px 0 14px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
.entry-title strong { font-size: 14.5px; color: #0f172a; }
.company { color: #3b82f6; font-weight: 500; }
.date { font-size: 12px; color: #94a3b8; white-space: nowrap; font-weight: 500; }
.location { font-size: 11px; color: #94a3b8; }
ul { padding-left: 16px; list-style: none; }
li { margin-bottom: 5px; font-size: 13px; color: #334155; position: relative; padding-left: 14px; }
li::before { content: "\\2022"; color: #3b82f6; font-size: 16px; position: absolute; left: 0; top: -2px; }
p { margin: 4px 0; font-size: 13px; color: #334155; }
.summary { margin-bottom: 22px; font-size: 14px; color: #475569; line-height: 1.7; padding: 14px 18px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; }
.skill-pill { background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.tech-pill { font-size: 11px; color: #3b82f6; background: #eff6ff; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
.cert-list { padding-left: 0; }
.cert-list li { padding-left: 14px; }
.cert-issuer { color: #94a3b8; font-size: 12px; }
"""

# ---------------------------------------------------------------------------
# Template: Minimal
# ---------------------------------------------------------------------------
MINIMAL_CSS = FONTS_IMPORT + BASE_CSS + """
body { font-family: 'Inter', -apple-system, sans-serif; max-width: 740px; margin: 0 auto; padding: 56px 40px; color: #18181b; line-height: 1.6; font-size: 13px; font-weight: 300; }
h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 6px; }
.contact { color: #71717a; font-size: 12px; margin-bottom: 32px; font-weight: 400; }
.contact a { color: #71717a; border-bottom: 1px solid #d4d4d8; }
h2 { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 4px; color: #a1a1aa; margin: 36px 0 14px; padding-bottom: 8px; border-bottom: 1px solid #f4f4f5; }
.entry-title strong { font-size: 13.5px; font-weight: 600; }
.company { color: #71717a; font-weight: 400; }
.date { font-size: 11px; color: #a1a1aa; white-space: nowrap; font-weight: 400; }
.location { font-size: 10px; color: #a1a1aa; }
ul { padding-left: 14px; list-style: none; }
li { margin-bottom: 3px; font-size: 12.5px; color: #3f3f46; position: relative; padding-left: 10px; }
li::before { content: "–"; color: #d4d4d8; position: absolute; left: 0; }
p { margin: 4px 0; font-size: 12.5px; color: #3f3f46; }
.summary { margin-bottom: 28px; font-size: 13px; color: #52525b; line-height: 1.75; }
.skill-pill { background: #fafafa; border: 1px solid #e4e4e7; padding: 3px 10px; border-radius: 4px; font-size: 11px; color: #3f3f46; font-weight: 400; }
.tech-pill { font-size: 10px; color: #71717a; background: #fafafa; padding: 2px 7px; border-radius: 3px; }
.cert-list { padding-left: 0; }
.cert-list li { padding-left: 10px; font-size: 12.5px; }
.cert-issuer { color: #a1a1aa; font-size: 11px; }
"""

# ---------------------------------------------------------------------------
# Template: Executive
# ---------------------------------------------------------------------------
EXECUTIVE_CSS = FONTS_IMPORT + BASE_CSS + """
body { font-family: 'Source Sans 3', 'Helvetica Neue', sans-serif; max-width: 820px; margin: 0 auto; padding: 48px 44px; color: #1c1917; line-height: 1.6; font-size: 13.5px; }
h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 600; color: #1c1917; letter-spacing: -0.5px; margin-bottom: 4px; }
.contact { font-size: 12.5px; color: #78716c; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #d6d3d1; }
.contact a { color: #78716c; }
h2 { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; color: #292524; margin: 32px 0 14px; padding-bottom: 6px; border-bottom: 1px solid #e7e5e4; letter-spacing: 0.5px; }
.entry-title strong { font-size: 14px; font-weight: 600; }
.company { color: #78716c; }
.date { font-size: 12px; color: #a8a29e; white-space: nowrap; }
.location { font-size: 11px; color: #a8a29e; }
ul { padding-left: 16px; list-style: none; }
li { margin-bottom: 5px; font-size: 13px; color: #44403c; position: relative; padding-left: 12px; line-height: 1.55; }
li::before { content: "\\25AA"; color: #d6d3d1; position: absolute; left: 0; top: 0; font-size: 8px; }
p { margin: 4px 0; font-size: 13px; color: #44403c; }
.summary { margin-bottom: 24px; font-size: 14px; color: #44403c; line-height: 1.75; border-left: 3px solid #292524; padding-left: 16px; }
.skill-pill { background: #fafaf9; border: 1px solid #e7e5e4; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: #44403c; }
.tech-pill { font-size: 11px; color: #78716c; background: #fafaf9; padding: 2px 8px; border-radius: 3px; border: 1px solid #e7e5e4; }
.cert-list { padding-left: 0; }
.cert-list li { padding-left: 12px; }
.cert-issuer { color: #a8a29e; font-size: 12px; }
"""

# ---------------------------------------------------------------------------
# Template: Creative
# ---------------------------------------------------------------------------
CREATIVE_CSS = FONTS_IMPORT + BASE_CSS + """
body { font-family: 'DM Sans', sans-serif; max-width: 800px; margin: 0 auto; padding: 44px 40px; color: #1e1e2e; line-height: 1.6; font-size: 13.5px; background: #fff; }
h1 { font-size: 28px; font-weight: 700; color: #1e1e2e; margin-bottom: 4px; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.contact { font-size: 12.5px; color: #6b7280; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 2px dashed #e5e7eb; }
.contact a { color: #6366f1; font-weight: 500; }
h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #6366f1; margin: 32px 0 14px; padding-bottom: 8px; background: linear-gradient(90deg, #6366f1 0%, transparent 100%); background-size: 100% 2px; background-repeat: no-repeat; background-position: bottom; }
.entry-title strong { font-size: 14px; color: #1e1e2e; }
.company { color: #6366f1; font-weight: 500; }
.date { font-size: 12px; color: #9ca3af; white-space: nowrap; font-weight: 500; }
.location { font-size: 11px; color: #9ca3af; }
ul { padding-left: 16px; list-style: none; }
li { margin-bottom: 5px; font-size: 13px; color: #374151; position: relative; padding-left: 14px; }
li::before { content: "\\25B8"; color: #6366f1; font-size: 12px; position: absolute; left: 0; top: 1px; }
p { margin: 4px 0; font-size: 13px; color: #374151; }
.summary { margin-bottom: 24px; font-size: 14px; color: #4b5563; line-height: 1.75; padding: 16px 20px; background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 10px; }
.skill-pill { background: linear-gradient(135deg, #eef2ff, #f5f3ff); color: #4338ca; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid #e0e7ff; }
.tech-pill { font-size: 11px; color: #6366f1; background: #eef2ff; padding: 2px 10px; border-radius: 12px; font-weight: 500; }
.cert-list { padding-left: 0; }
.cert-list li { padding-left: 14px; }
.cert-issuer { color: #9ca3af; font-size: 12px; }
"""

TEMPLATE_CSS = {
    "classic": CLASSIC_CSS,
    "modern": MODERN_CSS,
    "minimal": MINIMAL_CSS,
    "executive": EXECUTIVE_CSS,
    "creative": CREATIVE_CSS,
}


def render_template(content: dict, template_id: str) -> str:
    css = TEMPLATE_CSS.get(template_id, CLASSIC_CSS)

    name = content.get("name", "")
    email = content.get("email", "")
    phone = content.get("phone", "")
    linkedin = content.get("linkedinUrl", "")
    github = content.get("githubUrl", "")
    portfolio = content.get("portfolioUrl", "")
    summary = content.get("summary", "")

    contact_parts = [p for p in [email, phone] if p]
    link_parts = []
    if linkedin:
        link_parts.append(f'<a href="{linkedin}">LinkedIn</a>')
    if github:
        link_parts.append(f'<a href="{github}">GitHub</a>')
    if portfolio:
        link_parts.append(f'<a href="{portfolio}">Portfolio</a>')

    contact_line = " &nbsp;|&nbsp; ".join(contact_parts)
    if link_parts:
        contact_line += (" &nbsp;|&nbsp; " if contact_line else "") + " &nbsp;|&nbsp; ".join(link_parts)

    body_sections = []
    if summary:
        body_sections.append(f'<div class="summary">{summary}</div>')
    body_sections.append(_section_experiences(content.get("experiences", [])))
    body_sections.append(_section_skills(content.get("skills", [])))
    body_sections.append(_section_projects(content.get("projects", [])))
    body_sections.append(_section_education(content.get("education", [])))
    body_sections.append(_section_certifications(content.get("certifications", [])))

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>{css}</style>
</head>
<body>
<h1>{name}</h1>
<div class="contact">{contact_line}</div>
{''.join(s for s in body_sections if s)}
</body>
</html>"""
    return html
