export function formatDate(d) {
  if (!d) return '';
  const s = d.trim();
  const iso = [
    /^\d{4}-\d{2}-\d{2}T/,
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{4}-\d{2}$/,
  ];
  for (const re of iso) {
    if (re.test(s)) {
      const dt = new Date(s.length === 7 ? `${s}-01` : s);
      if (!isNaN(dt)) {
        return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    }
  }
  if (/^\d{4}$/.test(s)) return s;
  return s;
}

export function groupSkills(skills = []) {
  const grouped = {};
  for (const s of skills) {
    const cat = s.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s.name);
  }
  return grouped;
}
