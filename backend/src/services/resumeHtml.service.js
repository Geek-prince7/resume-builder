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
};

function renderResumeHtml(content, templateId = 'classic', options = {}) {
  const [accent, ink, tint] = colors[templateId] || colors.classic;
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
    *{box-sizing:border-box} @page{size:${options.pageSize === 'A4' ? 'A4' : 'Letter'};margin:0}
    body{margin:0;background:white;color:${ink};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}pt;line-height:${compact ? 1.35 : 1.46}}
    main{padding:${pagePadding}} h1{font-size:${compact ? 22 : 26}pt;line-height:1.05;margin:0 0 5px;color:${ink}}
    .contact{font-size:8.6pt;color:#6b7280;border-bottom:2px solid ${accent};padding-bottom:9px;margin-bottom:12px;overflow-wrap:anywhere}
    .summary{background:${tint};border-left:3px solid ${accent};padding:8px 10px;margin-bottom:${sectionGap}px}
    section{margin-top:${sectionGap}px} h2{color:${accent};font-size:10pt;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 7px;border-bottom:1px solid #d1d5db;padding-bottom:4px}
    .entry{margin-bottom:${compact ? 7 : 10}px}.row{display:flex;justify-content:space-between;gap:12px}.date{font-size:8.5pt;color:#6b7280;white-space:nowrap}.muted{font-size:8.3pt;color:#6b7280}.accent{color:${accent}}
    ul{margin:4px 0 0;padding-left:16px}li{margin:1.5px 0}p{margin:3px 0}.avoid-break{break-inside:avoid;page-break-inside:avoid}
    .skills{margin:4px 0}.skills span,.tags span{display:inline-block;background:${tint};border:1px solid #e5e7eb;border-radius:9px;padding:1px 6px;margin:1px 2px;font-size:8.4pt}.tags{margin-top:4px}
    .languages{display:flex;gap:8px;flex-wrap:wrap}.languages span{background:${tint};padding:2px 7px;border-radius:8px}
  </style></head><body><main><h1>${escapeHtml(content.name)}</h1><div class="contact">${contact}</div>
  ${content.summary ? `<div class="summary">${escapeHtml(content.summary)}</div>` : ''}
  ${section('Experience', experiences)}${section('Skills', skills)}${section('Projects', projects)}${section('Education', education)}${section('Certifications', certifications ? `<ul>${certifications}</ul>` : '')}${section('Awards', awards)}${section('Publications', publications)}${section('Volunteer Work', volunteer)}${section('Patents', patents ? `<ul>${patents}</ul>` : '')}${section('Achievements', achievements ? `<ul>${achievements}</ul>` : '')}${section('Languages', languages ? `<div class="languages">${languages}</div>` : '')}${customSections}
  </main></body></html>`;
}

module.exports = { renderResumeHtml };
