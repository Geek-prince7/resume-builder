import { forwardRef } from 'react';
import { formatDate, groupSkills } from './shared';

const premiumTheme = ({ accent, ink, tint, font = "'DM Sans', Arial, sans-serif", heading = font, extra = '' }) => `
  @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Libre+Caslon+Text:wght@400;700&family=Manrope:wght@400;500;600;700&display=swap");
  .resume { font-family:${font}; max-width:820px; margin:0 auto; padding:46px 42px; color:${ink}; line-height:1.58; font-size:13.25px; }
  .resume h1 { font-family:${heading}; font-size:30px; line-height:1.05; margin:0 0 6px; color:${ink}; }
  .resume .contact { color:#64748b; font-size:12px; margin-bottom:24px; padding-bottom:14px; border-bottom:2px solid ${accent}; }
  .resume .contact a { color:${accent}; text-decoration:none; font-weight:600; }
  .resume h2 { font-family:${heading}; color:${accent}; font-size:11px; text-transform:uppercase; letter-spacing:2.4px; margin:29px 0 13px; padding-bottom:6px; border-bottom:1px solid ${accent}55; }
  .resume .entry-title { font-weight:700; font-size:14px; color:${ink}; }
  .resume .company { color:${accent}; font-weight:600; }
  .resume .date { color:#64748b; font-size:11.5px; font-weight:500; }
  .resume .location { color:#94a3b8; font-size:10.5px; }
  .resume .summary { color:${ink}cc; background:${tint}; border-left:4px solid ${accent}; padding:13px 16px; margin-bottom:22px; line-height:1.7; }
  .resume .skill-pill,.resume .tech-pill { display:inline-block; color:${accent}; background:${tint}; border:1px solid ${accent}25; border-radius:999px; padding:3px 10px; font-size:11px; font-weight:600; }
  .resume ul { padding-left:16px; margin:4px 0; }
  .resume li { margin-bottom:4px; font-size:12.8px; color:${ink}e8; }
  ${extra}
`;

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
  editorial: premiumTheme({ accent:'#8b1e3f', ink:'#25171c', tint:'#fdf2f5', font:"'Libre Caslon Text', Georgia, serif", heading:"'Libre Caslon Text', Georgia, serif", extra:'.resume h1{font-size:34px;font-weight:400;letter-spacing:-1px}.resume .contact{font-family:Manrope,Arial,sans-serif;text-transform:uppercase;letter-spacing:.7px;border-bottom:1px solid #8b1e3f}.resume .summary{text-align:center;background:white;border:solid #e5c5cf;border-width:1px 0;font-style:italic}.resume h2{text-align:center;border:0;font-family:Manrope,Arial,sans-serif;font-size:10px;letter-spacing:3.4px}' }),
  swiss: premiumTheme({ accent:'#dc2626', ink:'#111827', tint:'#f9fafb', font:'Arial,Helvetica,sans-serif', extra:'.resume h1{font-size:36px;letter-spacing:-2px}.resume .contact{border-bottom-width:5px}.resume .summary{border-left-width:8px;font-weight:500}.resume h2{color:#111827;border:0;border-left:7px solid #dc2626;padding:4px 0 4px 10px;letter-spacing:1px}' }),
  atlas: premiumTheme({ accent:'#b28a3d', ink:'#10233f', tint:'#f8f5ee', heading:"'Libre Caslon Text',Georgia,serif", extra:'.resume .contact{border-bottom:3px double #b28a3d}.resume .summary{border:solid #d8c69f;border-width:1px 0}.resume h2{color:#10233f;border-bottom:2px solid #b28a3d}' }),
  noir: premiumTheme({ accent:'#111111', ink:'#18181b', tint:'#f4f4f5', extra:'.resume h1{font-size:36px;text-transform:uppercase;letter-spacing:2px}.resume .contact{background:#111;color:#fff;padding:8px 10px;border:0}.resume .summary{border-left:0;border-top:4px solid #111}.resume h2{color:#111;border-bottom:3px solid #111;letter-spacing:3px}' }),
  ivy: premiumTheme({ accent:'#285943', ink:'#1f352d', tint:'#f2f7f4', font:"'Libre Caslon Text',Georgia,serif", heading:"'Libre Caslon Text',Georgia,serif", extra:'.resume h1{text-align:center;font-size:32px}.resume .contact{text-align:center;border-bottom:3px double #285943;font-family:Manrope,Arial,sans-serif}.resume .summary{text-align:center;background:white;border:0;font-style:italic}.resume h2{text-align:center;text-transform:none;font-size:15px;letter-spacing:.4px}' }),
  coastal: premiumTheme({ accent:'#0f766e', ink:'#164e63', tint:'#f0fdfa', font:"Manrope,Arial,sans-serif", extra:'.resume h1{font-weight:500;font-size:32px}.resume .contact{border-bottom-color:#5eead4}.resume .summary{border-radius:0 12px 12px 0}.resume h2{border-bottom-color:#99f6e4;letter-spacing:2.8px}' }),
  slate: premiumTheme({ accent:'#475569', ink:'#1e293b', tint:'#f1f5f9', font:"Manrope,Arial,sans-serif", extra:'.resume{font-size:12.5px;line-height:1.48}.resume h2{background:#1e293b;color:white;border:0;padding:5px 8px}.resume li{margin-bottom:2px}.resume section>div{break-inside:avoid}' }),
  aurora: premiumTheme({ accent:'#7c3aed', ink:'#172554', tint:'#f5f3ff', extra:'.resume h1{color:#6d28d9;font-size:34px}.resume .contact{border-bottom:3px solid #22d3ee}.resume .summary{background:linear-gradient(135deg,#f5f3ff,#ecfeff);border-radius:7px}.resume h2{border-image:linear-gradient(90deg,#7c3aed,#22d3ee) 1}' }),
  monogram: premiumTheme({ accent:'#a16207', ink:'#292524', tint:'#fffbeb', heading:"'Libre Caslon Text',Georgia,serif", extra:'.resume h1{font-size:34px;border-left:9px solid #a16207;padding-left:14px}.resume .contact{margin-left:23px;border-bottom:1px solid #d6d3d1}.resume .summary{border:1px solid #fde68a;border-left:4px solid #a16207}.resume h2{text-transform:none;font-size:15px;letter-spacing:.4px}' }),
  compact: premiumTheme({ accent:'#334155', ink:'#0f172a', tint:'#f8fafc', font:'Arial,Helvetica,sans-serif', extra:'.resume{padding:34px 38px;font-size:11.5px;line-height:1.34}.resume h1{font-size:27px}.resume .contact{margin-bottom:10px;padding-bottom:7px}.resume .summary{padding:7px 10px;margin-bottom:9px}.resume h2{font-size:9px;margin:16px 0 7px;padding-bottom:3px}.resume li{font-size:11.3px;margin-bottom:1px}.resume section>div{margin-bottom:7px!important}' }),
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
