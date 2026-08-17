import { forwardRef } from 'react';
import { formatDate, groupSkills } from './shared';

const TEMPLATE_STYLES = {
  classic: `
    @import url("https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@400;500;600&display=swap");
    .resume { font-family: 'Merriweather', Georgia, serif; max-width: 800px; margin: 0 auto; padding: 48px 40px; color: #2c2c2c; line-height: 1.65; font-size: 13.5px; }
    .resume h1 { font-size: 26px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; }
    .resume .contact { color: #5a5a5a; font-size: 12.5px; margin-bottom: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 16px; font-family: 'Inter', sans-serif; }
    .resume .contact a { color: #5a5a5a; text-decoration: none; }
    .resume h2 { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2.5px; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 6px; margin: 28px 0 16px; }
    .resume .entry-title { font-size: 14px; font-weight: 700; }
    .resume .company { color: #555; font-style: italic; }
    .resume .date { font-family: 'Inter', sans-serif; font-size: 12px; color: #777; }
    .resume .location { font-family: 'Inter', sans-serif; font-size: 11px; color: #999; }
    .resume .summary { font-style: italic; margin-bottom: 20px; font-size: 13.5px; color: #444; line-height: 1.7; }
    .resume .skill-pill { background: #f5f5f5; border: 1px solid #ddd; padding: 3px 10px; border-radius: 3px; font-size: 12px; font-family: 'Inter', sans-serif; display: inline-block; }
    .resume .tech-pill { font-size: 11px; color: #666; background: #f9f9f9; padding: 2px 8px; border-radius: 3px; display: inline-block; font-family: 'Inter', sans-serif; }
    .resume ul { padding-left: 18px; margin: 4px 0; }
    .resume li { margin-bottom: 4px; font-size: 13px; color: #3a3a3a; list-style: disc; }
  `,
  modern: `
    @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap");
    .resume { font-family: 'DM Sans', sans-serif; max-width: 820px; margin: 0 auto; padding: 44px 40px; color: #1e293b; line-height: 1.6; font-size: 13.5px; }
    .resume h1 { font-size: 30px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
    .resume .contact { font-size: 12.5px; color: #64748b; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 3px solid #3b82f6; }
    .resume .contact a { color: #3b82f6; text-decoration: none; font-weight: 500; }
    .resume h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #3b82f6; margin: 30px 0 14px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    .resume .entry-title { font-size: 14.5px; font-weight: 700; color: #0f172a; }
    .resume .company { color: #3b82f6; font-weight: 500; }
    .resume .date { font-size: 12px; color: #94a3b8; font-weight: 500; }
    .resume .location { font-size: 11px; color: #94a3b8; }
    .resume .summary { margin-bottom: 22px; font-size: 14px; color: #475569; line-height: 1.7; padding: 14px 18px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; }
    .resume .skill-pill { background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-block; }
    .resume .tech-pill { font-size: 11px; color: #3b82f6; background: #eff6ff; padding: 2px 8px; border-radius: 10px; font-weight: 500; display: inline-block; }
    .resume ul { padding-left: 16px; margin: 4px 0; list-style: none; }
    .resume li { margin-bottom: 5px; font-size: 13px; color: #334155; padding-left: 14px; position: relative; }
    .resume li::before { content: "\\2022"; color: #3b82f6; font-size: 16px; position: absolute; left: 0; top: -2px; }
  `,
  minimal: `
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap");
    .resume { font-family: 'Inter', sans-serif; max-width: 740px; margin: 0 auto; padding: 56px 40px; color: #18181b; line-height: 1.6; font-size: 13px; font-weight: 300; }
    .resume h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.3px; margin: 0 0 6px; }
    .resume .contact { color: #71717a; font-size: 12px; margin-bottom: 32px; font-weight: 400; }
    .resume .contact a { color: #71717a; text-decoration: none; border-bottom: 1px solid #d4d4d8; }
    .resume h2 { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 4px; color: #a1a1aa; margin: 36px 0 14px; padding-bottom: 8px; border-bottom: 1px solid #f4f4f5; }
    .resume .entry-title { font-size: 13.5px; font-weight: 600; }
    .resume .company { color: #71717a; font-weight: 400; }
    .resume .date { font-size: 11px; color: #a1a1aa; font-weight: 400; }
    .resume .location { font-size: 10px; color: #a1a1aa; }
    .resume .summary { margin-bottom: 28px; font-size: 13px; color: #52525b; line-height: 1.75; }
    .resume .skill-pill { background: #fafafa; border: 1px solid #e4e4e7; padding: 3px 10px; border-radius: 4px; font-size: 11px; color: #3f3f46; display: inline-block; }
    .resume .tech-pill { font-size: 10px; color: #71717a; background: #fafafa; padding: 2px 7px; border-radius: 3px; display: inline-block; }
    .resume ul { padding-left: 14px; margin: 4px 0; list-style: none; }
    .resume li { margin-bottom: 3px; font-size: 12.5px; color: #3f3f46; padding-left: 10px; position: relative; }
    .resume li::before { content: "\\2013"; color: #d4d4d8; position: absolute; left: 0; }
  `,
  executive: `
    @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600;700&display=swap");
    .resume { font-family: 'Source Sans 3', sans-serif; max-width: 820px; margin: 0 auto; padding: 48px 44px; color: #1c1917; line-height: 1.6; font-size: 13.5px; }
    .resume h1 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 600; color: #1c1917; letter-spacing: -0.5px; margin: 0 0 4px; }
    .resume .contact { font-size: 12.5px; color: #78716c; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #d6d3d1; }
    .resume .contact a { color: #78716c; text-decoration: none; }
    .resume h2 { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; color: #292524; margin: 32px 0 14px; padding-bottom: 6px; border-bottom: 1px solid #e7e5e4; }
    .resume .entry-title { font-size: 14px; font-weight: 600; }
    .resume .company { color: #78716c; }
    .resume .date { font-size: 12px; color: #a8a29e; }
    .resume .location { font-size: 11px; color: #a8a29e; }
    .resume .summary { margin-bottom: 24px; font-size: 14px; color: #44403c; line-height: 1.75; border-left: 3px solid #292524; padding-left: 16px; }
    .resume .skill-pill { background: #fafaf9; border: 1px solid #e7e5e4; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: #44403c; display: inline-block; }
    .resume .tech-pill { font-size: 11px; color: #78716c; background: #fafaf9; padding: 2px 8px; border-radius: 3px; border: 1px solid #e7e5e4; display: inline-block; }
    .resume ul { padding-left: 16px; margin: 4px 0; list-style: none; }
    .resume li { margin-bottom: 5px; font-size: 13px; color: #44403c; padding-left: 12px; position: relative; line-height: 1.55; }
    .resume li::before { content: "\\25AA"; color: #d6d3d1; position: absolute; left: 0; top: 0; font-size: 8px; }
  `,
  creative: `
    @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap");
    .resume { font-family: 'DM Sans', sans-serif; max-width: 800px; margin: 0 auto; padding: 44px 40px; color: #1e1e2e; line-height: 1.6; font-size: 13.5px; }
    .resume h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .resume .contact { font-size: 12.5px; color: #6b7280; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 2px dashed #e5e7eb; }
    .resume .contact a { color: #6366f1; text-decoration: none; font-weight: 500; }
    .resume h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #6366f1; margin: 32px 0 14px; padding-bottom: 8px; background: linear-gradient(90deg, #6366f1 0%, transparent 100%); background-size: 100% 2px; background-repeat: no-repeat; background-position: bottom; }
    .resume .entry-title { font-size: 14px; font-weight: 700; color: #1e1e2e; }
    .resume .company { color: #6366f1; font-weight: 500; }
    .resume .date { font-size: 12px; color: #9ca3af; font-weight: 500; }
    .resume .location { font-size: 11px; color: #9ca3af; }
    .resume .summary { margin-bottom: 24px; font-size: 14px; color: #4b5563; line-height: 1.75; padding: 16px 20px; background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 10px; }
    .resume .skill-pill { background: linear-gradient(135deg, #eef2ff, #f5f3ff); color: #4338ca; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid #e0e7ff; display: inline-block; }
    .resume .tech-pill { font-size: 11px; color: #6366f1; background: #eef2ff; padding: 2px 10px; border-radius: 12px; font-weight: 500; display: inline-block; }
    .resume ul { padding-left: 16px; margin: 4px 0; list-style: none; }
    .resume li { margin-bottom: 5px; font-size: 13px; color: #374151; padding-left: 14px; position: relative; }
    .resume li::before { content: "\\25B8"; color: #6366f1; font-size: 12px; position: absolute; left: 0; top: 1px; }
  `,
};

const PRINT_CSS = `
@media print {
  @page { margin: 0; size: letter; }
  body { margin: 0; padding: 0; }
  .resume { padding: 36px 40px; }
}
`;

const ResumeDocument = forwardRef(function ResumeDocument({ content, templateId }, ref) {
  if (!content) return null;
  const css = TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES.classic;
  const skills = groupSkills(content.skills);

  const contactParts = [content.email, content.phone].filter(Boolean);
  const linkParts = [];
  if (content.linkedinUrl) linkParts.push({ href: content.linkedinUrl, label: 'LinkedIn' });
  if (content.githubUrl) linkParts.push({ href: content.githubUrl, label: 'GitHub' });
  if (content.portfolioUrl) linkParts.push({ href: content.portfolioUrl, label: 'Portfolio' });

  return (
    <div ref={ref}>
      <style>{css + PRINT_CSS}</style>
      <div className="resume">
        <h1>{content.name}</h1>
        <div className="contact">
          {contactParts.join(' | ')}
          {contactParts.length > 0 && linkParts.length > 0 && ' | '}
          {linkParts.map((l, i) => (
            <span key={l.href}>
              {i > 0 && ' | '}
              <a href={l.href}>{l.label}</a>
            </span>
          ))}
        </div>

        {content.summary && <div className="summary">{content.summary}</div>}

        {content.experiences?.length > 0 && (
          <section>
            <h2>Experience</h2>
            {content.experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 4 }}>
                  <div>
                    <span className="entry-title">{exp.role}</span>
                    {' — '}
                    <span className="company">{exp.company}</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="date">
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                    {exp.location && <div className="location">{exp.location}</div>}
                  </div>
                </div>
                {exp.highlights?.length > 0 && (
                  <ul>
                    {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {Object.keys(skills).length > 0 && (
          <section>
            <h2>Skills</h2>
            {Object.entries(skills).map(([cat, names]) => (
              <div key={cat} style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: '0.85em', marginRight: 8 }}>{cat}:</strong>
                <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
                  {names.map((n) => <span key={n} className="skill-pill">{n}</span>)}
                </span>
              </div>
            ))}
          </section>
        )}

        {content.projects?.length > 0 && (
          <section>
            <h2>Projects</h2>
            {content.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <strong>{p.name}</strong>
                {p.description && <p style={{ margin: '4px 0', fontSize: '13px' }}>{p.description}</p>}
                {p.technologies?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {p.technologies.map((t) => <span key={t} className="tech-pill">{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {content.education?.length > 0 && (
          <section>
            <h2>Education</h2>
            {content.education.map((edu, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span className="entry-title">
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </span>
                  {' — '}
                  <span className="company">{edu.institution}</span>
                </div>
                <span className="date">
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </span>
              </div>
            ))}
          </section>
        )}

        {content.certifications?.length > 0 && (
          <section>
            <h2>Certifications</h2>
            <ul>
              {content.certifications.map((c, i) => (
                <li key={i}>
                  {c.name}
                  {c.issuer && <span style={{ color: '#999', fontSize: '12px' }}> — {c.issuer}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {content.achievements?.length > 0 && <section><h2>Achievements</h2><ul>{content.achievements.map((item, i) => <li key={i}>{item}</li>)}</ul></section>}
        {content.languages?.length > 0 && <section><h2>Languages</h2><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{content.languages.map((item, i) => <span key={i} className="skill-pill">{item.name}{item.proficiency ? ` (${item.proficiency.replaceAll('_', ' ')})` : ''}</span>)}</div></section>}
      </div>
    </div>
  );
});

export default ResumeDocument;
