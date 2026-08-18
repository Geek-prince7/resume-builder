const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

const colors = {
  classic: ['#111827', '#374151', '#f3f4f6'], modern: ['#2563eb', '#1e3a8a', '#eff6ff'],
  minimal: ['#52525b', '#18181b', '#fafafa'], executive: ['#292524', '#57534e', '#fafaf9'],
  creative: ['#6366f1', '#4c1d95', '#eef2ff'],
  editorial: ['#8b1e3f', '#25171c', '#fdf2f5'], swiss: ['#dc2626', '#111827', '#f9fafb'],
  atlas: ['#b28a3d', '#10233f', '#f8f5ee'], noir: ['#111111', '#18181b', '#f4f4f5'],
  ivy: ['#285943', '#1f352d', '#f2f7f4'], coastal: ['#0f766e', '#164e63', '#f0fdfa'],
  slate: ['#475569', '#1e293b', '#f1f5f9'], aurora: ['#7c3aed', '#172554', '#f5f3ff'],
  monogram: ['#a16207', '#292524', '#fffbeb'], compact: ['#334155', '#0f172a', '#f8fafc'],
};

const themeOverrides = {
  classic: 'body{font-family:Georgia,"Times New Roman",serif}.contact,.date,.muted,h2{font-family:Arial,sans-serif}',
  minimal: 'main{max-width:175mm;margin:auto}h1{font-size:21pt;font-weight:500;letter-spacing:-.4px}.contact{border:0;padding-bottom:4px;margin-bottom:18px}h2{color:#71717a;border-bottom:1px solid #e4e4e7;letter-spacing:2.8px;font-size:8.8pt}.summary{background:transparent;border:0;padding:0;color:#52525b}',
  executive: 'body{font-family:Arial,sans-serif}h1{font-family:Georgia,serif;font-size:30pt;font-weight:500}.contact{border-bottom:1px solid #a8a29e}h2{font-family:Georgia,serif;text-transform:none;letter-spacing:.2px;font-size:13pt;color:#292524}.summary{background:transparent;border-left:2px solid #292524;padding-left:12px;font-family:Georgia,serif;font-style:italic}',
  creative: 'h1{color:#4f46e5;font-size:29pt}.contact{border-bottom:3px solid #8b5cf6}.summary{border-radius:8px;border-left:0;background:linear-gradient(135deg,#eef2ff,#faf5ff)}h2{border-bottom:0;background:linear-gradient(90deg,#6366f1,#c4b5fd);background-size:100% 2px;background-repeat:no-repeat;background-position:bottom}',
  editorial: 'body{font-family:Georgia,"Times New Roman",serif}h1{font-size:31pt;font-weight:400;letter-spacing:-.8px}.contact{font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.7px;border-bottom:1px solid #8b1e3f}.summary{background:transparent;border:0;border-top:1px solid #e5c5cf;border-bottom:1px solid #e5c5cf;text-align:center;font-style:italic;padding:10px 18px}h2{font-family:Arial,sans-serif;text-align:center;border:0;letter-spacing:3.2px;font-size:8.8pt}',
  swiss: 'body{font-family:Arial,Helvetica,sans-serif}h1{font-size:32pt;letter-spacing:-1.5px}.contact{border-bottom:5px solid #dc2626;color:#374151}.summary{background:#f9fafb;border-left:7px solid #dc2626;font-weight:500}h2{border:0;border-left:7px solid #dc2626;padding:3px 0 3px 9px;color:#111827;letter-spacing:1px}',
  atlas: 'body{font-family:Arial,sans-serif}h1{font-family:Georgia,serif;color:#10233f;font-size:29pt}.contact{border-bottom:3px double #b28a3d}.summary{background:#f8f5ee;border-left:0;border-top:1px solid #d8c69f;border-bottom:1px solid #d8c69f}h2{color:#10233f;border-bottom:2px solid #b28a3d;letter-spacing:2px}',
  noir: 'body{font-family:Arial,sans-serif}h1{font-size:34pt;text-transform:uppercase;letter-spacing:2px}.contact{background:#111;color:#fff;padding:7px 9px;border:0}.summary{background:#f4f4f5;border-left:0;border-top:4px solid #111}h2{color:#111;border-bottom:3px solid #111;letter-spacing:3px}',
  ivy: 'body{font-family:Georgia,"Times New Roman",serif}h1{text-align:center;font-size:28pt;color:#1f352d}.contact{text-align:center;border-bottom:3px double #285943;font-family:Arial,sans-serif}.summary{background:transparent;border:0;text-align:center;font-style:italic}h2{font-family:Georgia,serif;text-transform:none;text-align:center;letter-spacing:.5px;font-size:12pt;border-bottom:1px solid #7aa18f}',
  coastal: 'body{font-family:Arial,sans-serif}h1{font-weight:400;color:#164e63;font-size:29pt}.contact{border-bottom:2px solid #5eead4}.summary{background:#f0fdfa;border-left:3px solid #14b8a6;border-radius:0 10px 10px 0}h2{color:#0f766e;border-bottom:1px solid #99f6e4;letter-spacing:2.4px}',
  slate: 'body{font-family:Arial,sans-serif}h1{font-size:25pt}.contact{border-bottom:3px solid #475569}.summary{background:#f1f5f9;border-left:4px solid #475569}h2{background:#1e293b;color:#fff;border:0;padding:4px 7px;letter-spacing:1.8px}.entry{margin-bottom:6px}li{margin:1px 0}',
  aurora: 'body{font-family:Arial,sans-serif}h1{color:#6d28d9;font-size:30pt}.contact{border-bottom:3px solid #22d3ee}.summary{background:linear-gradient(135deg,#f5f3ff,#ecfeff);border-left:4px solid #7c3aed;border-radius:6px}h2{color:#6d28d9;border-image:linear-gradient(90deg,#7c3aed,#22d3ee) 1;letter-spacing:2.5px}',
  monogram: 'body{font-family:Arial,sans-serif}h1{font-family:Georgia,serif;font-size:30pt;border-left:8px solid #a16207;padding-left:12px}.contact{margin-left:20px;border-bottom:1px solid #d6d3d1}.summary{background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #a16207}h2{font-family:Georgia,serif;text-transform:none;font-size:12pt;letter-spacing:.4px;border-bottom:1px solid #d6d3d1}',
  compact: 'body{font-size:9.5pt;line-height:1.28}h1{font-size:22pt}.contact{padding-bottom:6px;margin-bottom:7px}section{margin-top:8px}h2{font-size:8.5pt;margin-bottom:4px;padding-bottom:2px}.summary{padding:5px 8px;margin-bottom:6px}.entry{margin-bottom:4px}ul{margin-top:2px}li{margin:.5px 0}.skills{margin:2px 0}',
};

function renderResumeHtml(content, templateId = 'classic', options = {}) {
  const [accent, ink, tint] = colors[templateId] || colors.classic;
  const themeCss = themeOverrides[templateId] || '';
  const compact = options.density === 'compact';
  const fontSize = compact ? 10.2 : 11;
  const sectionGap = compact ? 11 : 16;
  const pagePadding = compact ? '10mm 12mm' : '13mm 15mm';
  const skillGroups = (content.skills || []).reduce((groups, skill) => {
    const category = skill.category || 'Skills';
    (groups[category] ||= []).push(skill.name);
    return groups;
  }, {});
  const contact = [content.email, content.phone, content.linkedinUrl, content.githubUrl, content.portfolioUrl]
    .filter(Boolean).map(escapeHtml).join(' &nbsp;|&nbsp; ');

  const experiences = (content.experiences || []).map((exp) => `
    <article class="entry avoid-break"><div class="row"><div><strong>${escapeHtml(exp.role)}</strong> - <span class="accent">${escapeHtml(exp.company)}</span></div><span class="date">${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}</span></div>
    ${exp.location ? `<div class="muted">${escapeHtml(exp.location)}</div>` : ''}
    ${exp.highlights?.length ? `<ul>${exp.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</article>`).join('');
  const skills = Object.entries(skillGroups).map(([category, names]) => `<div class="skills"><strong>${escapeHtml(category)}:</strong> ${names.map((name) => `<span>${escapeHtml(name)}</span>`).join('')}</div>`).join('');
  const projects = (content.projects || []).map((project) => `<article class="entry avoid-break"><strong>${escapeHtml(project.name)}</strong>${project.description ? `<p>${escapeHtml(project.description)}</p>` : ''}${project.technologies?.length ? `<div class="tags">${project.technologies.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}</article>`).join('');
  const education = (content.education || []).map((item) => `<article class="entry avoid-break"><div class="row"><div><strong>${escapeHtml(item.degree)}${item.field ? ` in ${escapeHtml(item.field)}` : ''}</strong> - ${escapeHtml(item.institution)}</div><span class="date">${formatDate(item.startDate)} - ${formatDate(item.endDate)}</span></div></article>`).join('');
  const certifications = (content.certifications || []).map((item) => `<li>${escapeHtml(item.name)}${item.issuer ? ` - ${escapeHtml(item.issuer)}` : ''}</li>`).join('');
  const achievements = (content.achievements || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const languages = (content.languages || []).map((item) => `<span>${escapeHtml(item.name)}${item.proficiency ? ` (${escapeHtml(item.proficiency.replaceAll('_', ' '))})` : ''}</span>`).join('');
  const awards = (content.awards || []).map((item) => `<article class="entry avoid-break"><strong>${escapeHtml(item.title)}</strong>${item.issuer ? ` - ${escapeHtml(item.issuer)}` : ''}${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}</article>`).join('');
  const publications = (content.publications || []).map((item) => `<article class="entry avoid-break"><strong>${escapeHtml(item.title)}</strong>${item.publisher ? ` - ${escapeHtml(item.publisher)}` : ''}${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}</article>`).join('');
  const volunteer = (content.volunteerWork || []).map((item) => `<article class="entry avoid-break"><strong>${escapeHtml(item.role)}</strong>${item.organization ? ` - ${escapeHtml(item.organization)}` : ''}${item.highlights?.length ? `<ul>${item.highlights.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : ''}</article>`).join('');
  const patents = (content.patents || []).map((item) => `<li>${escapeHtml(item.title)}${item.number ? ` - ${escapeHtml(item.number)}` : ''}</li>`).join('');
  const customSections = (content.customSections || []).map((custom) => section(escapeHtml(custom.title), custom.items?.length ? `<ul>${custom.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '')).join('');

  const section = (title, body) => body ? `<section><h2>${title}</h2>${body}</section>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box} @page{size:${options.pageSize === 'A4' ? 'A4' : 'Letter'};margin:${pagePadding}}
    body{margin:0;background:white;color:${ink};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}pt;line-height:${compact ? 1.35 : 1.46}}
    main{padding:0} h1{font-size:${compact ? 22 : 26}pt;line-height:1.05;margin:0 0 5px;color:${ink}}
    .contact{font-size:8.6pt;color:#6b7280;border-bottom:2px solid ${accent};padding-bottom:9px;margin-bottom:12px;overflow-wrap:anywhere}
    .summary{background:${tint};border-left:3px solid ${accent};padding:8px 10px;margin-bottom:${sectionGap}px}
    section{margin-top:${sectionGap}px} h2{color:${accent};font-size:10pt;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 7px;border-bottom:1px solid #d1d5db;padding-bottom:4px;break-after:avoid;page-break-after:avoid}
    .entry{margin-bottom:${compact ? 7 : 10}px}.row{display:flex;justify-content:space-between;gap:12px}.date{font-size:8.5pt;color:#6b7280;white-space:nowrap}.muted{font-size:8.3pt;color:#6b7280}.accent{color:${accent}}
    ul{margin:4px 0 0;padding-left:16px}li{margin:1.5px 0}p{margin:3px 0}.avoid-break{break-inside:avoid;page-break-inside:avoid}
    .skills{margin:4px 0;break-inside:avoid;page-break-inside:avoid}.skills span,.tags span{display:inline-block;background:${tint};border:1px solid #e5e7eb;border-radius:9px;padding:1px 6px;margin:1px 2px;font-size:8.4pt}.tags{margin-top:4px}
    .languages{display:flex;gap:8px;flex-wrap:wrap}.languages span{background:${tint};padding:2px 7px;border-radius:8px}
    ${themeCss}
  </style></head><body><main><h1>${escapeHtml(content.name)}</h1><div class="contact">${contact}</div>
  ${content.summary ? `<div class="summary">${escapeHtml(content.summary)}</div>` : ''}
  ${section('Experience', experiences)}${section('Skills', skills)}${section('Projects', projects)}${section('Education', education)}${section('Certifications', certifications ? `<ul>${certifications}</ul>` : '')}${section('Awards', awards)}${section('Publications', publications)}${section('Volunteer Work', volunteer)}${section('Patents', patents ? `<ul>${patents}</ul>` : '')}${section('Achievements', achievements ? `<ul>${achievements}</ul>` : '')}${section('Languages', languages ? `<div class="languages">${languages}</div>` : '')}${customSections}
  </main></body></html>`;
}

module.exports = { renderResumeHtml };
