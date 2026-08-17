function TagList({ values, tone }) {
  if (!values?.length) return <p className="text-sm text-gray-400">None</p>;
  const style = tone === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800';
  return <div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>{value}</span>)}</div>;
}

export default function AtsReport({ report, score }) {
  if (!report || Object.keys(report).length === 0) return null;
  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-gray-900">Truthful ATS analysis</h2><p className="text-sm text-gray-500">Only profile-backed skills are included in the resume.</p></div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">{score}% match</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div><h3 className="mb-2 text-sm font-semibold text-gray-800">Confirmed JD skills</h3><TagList values={report.confirmedSkills} tone="good" /></div>
        <div><h3 className="mb-2 text-sm font-semibold text-gray-800">Missing skills</h3><TagList values={report.missingSkills} tone="warn" /></div>
        <div><h3 className="mb-2 text-sm font-semibold text-gray-800">Strengths</h3><ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">{report.strengths?.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h3 className="mb-2 text-sm font-semibold text-gray-800">Recommended next steps</h3><ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">{report.recommendations?.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>
  );
}
