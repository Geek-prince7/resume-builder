import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTemplates, createJobDescription, generateResume, generateCoverLetter, getProfileVariants, enqueueResumeGeneration, getGenerationJob } from '../api';
import AdSlot from '../components/AdSlot';

export default function Generate() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [location, setLocation] = useState('');
  const [markApplied, setMarkApplied] = useState(false);
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState([]);
  const [profileVariantId, setProfileVariantId] = useState('');
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [backgroundGeneration, setBackgroundGeneration] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  const waitForJob = async (jobId) => {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const response = await getGenerationJob(jobId);
      if (response.data.state === 'completed') return response.data;
      if (response.data.state === 'failed') throw new Error(response.data.error || 'Background generation failed');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error('Background generation timed out');
  };

  useEffect(() => {
    getTemplates()
      .then((res) => {
        setTemplates(res.data);
        if (res.data.length > 0) setSelectedTemplate(res.data[0].id);
      })
      .catch(() => toast.error('Failed to load templates'));
    getProfileVariants().then((res) => setVariants(res.data)).catch(() => {});
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please paste the job description');
      return;
    }
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setGenerating(true);
    try {
      const jdRes = await createJobDescription({
        company,
        role,
        jobUrl: jobUrl.trim() || undefined,
        location,
        description,
        profileVariantId,
        applicationStatus: markApplied ? 'applied' : 'saved',
      });
      const jdId = jdRes.data._id;

      if (backgroundGeneration && !profileVariantId) {
        const queued = await enqueueResumeGeneration(jdId, selectedTemplate);
        await waitForJob(queued.data.jobId);
      } else {
        await generateResume(jdId, selectedTemplate, profileVariantId);
      }
      if (includeCoverLetter) await generateCoverLetter(jdId, profileVariantId);
      toast.success('Resume generated!');
      navigate(`/resume/${jdId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Tailored Resume</h1>

      <form onSubmit={handleGenerate} className="space-y-6">
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Google"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Job URL <span className="text-gray-400">(optional)</span></label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://company.com/jobs/123"
              />
              <p className="text-xs text-gray-400 mt-1">Optional because pasted or expired postings should still be trackable.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Bengaluru / Remote"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
            <input type="checkbox" checked={markApplied} onChange={(e) => setMarkApplied(e.target.checked)} />
            I have already applied for this job
          </label>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Job Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Paste the full job description here..."
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-xs font-medium text-gray-600">
              Profile variant
              <select value={profileVariantId} onChange={(e) => setProfileVariantId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Full profile</option>
                {variants.map((variant) => <option key={variant._id} value={variant._id}>{variant.name}</option>)}
              </select>
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
              <input type="checkbox" checked={includeCoverLetter} onChange={(e) => setIncludeCoverLetter(e.target.checked)} />
              Generate a tailored cover letter (uses 1 additional AI action)
            </label>
            {!profileVariantId && <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={backgroundGeneration} onChange={(e) => setBackgroundGeneration(e.target.checked)} />Run generation as a resilient background job</label>}
          </div>
        </section>

        <AdSlot
          slot={import.meta.env.VITE_ADSENSE_SLOT_GENERATE}
          className="bg-white rounded-lg border border-gray-200 p-2"
          minHeight={120}
        />

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-gray-900">Choose Template</h2><p className="mt-1 text-sm text-gray-500">ATS-friendly, print-tested designs for every career style.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{templates.length} designs</span></div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(showAllTemplates ? templates : templates.slice(0, 6)).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`group p-3 rounded-xl border-2 text-left transition-all ${
                  selectedTemplate === tpl.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="w-full aspect-[3/4] bg-gray-50 rounded-lg mb-2.5 flex items-center justify-center overflow-hidden">
                  <TemplatePreview id={tpl.id} selected={selectedTemplate === tpl.id} />
                </div>
                <div className="flex items-center justify-between gap-2"><p className="font-semibold text-gray-900 text-sm">{tpl.name}</p><span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">{tpl.category}</span></div>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{tpl.description}</p>
              </button>
            ))}
          </div>
          {templates.length > 6 && <div className="mt-5 flex justify-center"><button type="button" onClick={() => setShowAllTemplates((value) => !value)} className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700">{showAllTemplates ? 'Show fewer templates' : `Show ${templates.length - 6} more templates`}</button></div>}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={generating}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {generating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {generating ? 'Generating...' : 'Generate Resume'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TemplatePreview({ id }) {
  const configs = {
    classic:   { accent: '#1a1a1a', headerBg: '#1a1a1a', pillBg: '#f5f5f5', pillBorder: '#ddd' },
    modern:    { accent: '#3b82f6', headerBg: '#3b82f6', pillBg: '#eff6ff', pillBorder: '#dbeafe' },
    minimal:   { accent: '#a1a1aa', headerBg: '#e4e4e7', pillBg: '#fafafa', pillBorder: '#e4e4e7' },
    executive: { accent: '#292524', headerBg: '#292524', pillBg: '#fafaf9', pillBorder: '#e7e5e4' },
    creative:  { accent: '#6366f1', headerBg: '#6366f1', pillBg: '#eef2ff', pillBorder: '#e0e7ff' },
    editorial: { accent: '#8b1e3f', headerBg: '#8b1e3f', pillBg: '#fdf2f5', pillBorder: '#e5c5cf', layout: 'centered' },
    swiss:     { accent: '#dc2626', headerBg: '#111827', pillBg: '#f9fafb', pillBorder: '#fecaca', layout: 'block' },
    atlas:     { accent: '#b28a3d', headerBg: '#10233f', pillBg: '#f8f5ee', pillBorder: '#d8c69f', layout: 'double' },
    noir:      { accent: '#111111', headerBg: '#111111', pillBg: '#f4f4f5', pillBorder: '#d4d4d8', layout: 'dark' },
    ivy:       { accent: '#285943', headerBg: '#1f352d', pillBg: '#f2f7f4', pillBorder: '#b7d2c5', layout: 'centered' },
    coastal:   { accent: '#0f766e', headerBg: '#5eead4', pillBg: '#f0fdfa', pillBorder: '#99f6e4' },
    slate:     { accent: '#475569', headerBg: '#1e293b', pillBg: '#f1f5f9', pillBorder: '#cbd5e1', layout: 'block' },
    aurora:    { accent: '#7c3aed', headerBg: '#22d3ee', pillBg: '#f5f3ff', pillBorder: '#ddd6fe', layout: 'gradient' },
    monogram:  { accent: '#a16207', headerBg: '#292524', pillBg: '#fffbeb', pillBorder: '#fde68a', layout: 'side' },
    compact:   { accent: '#334155', headerBg: '#334155', pillBg: '#f8fafc', pillBorder: '#cbd5e1', layout: 'compact' },
  };
  const c = configs[id] || configs.classic;

  return (
    <div
      className="w-full h-full bg-white rounded-md p-2.5 flex flex-col gap-1 transition-transform group-hover:scale-[1.02]"
      style={{ borderTop: `${c.layout === 'double' ? 5 : 3}px ${c.layout === 'double' ? 'double' : 'solid'} ${c.accent}`, borderLeft: c.layout === 'side' ? `4px solid ${c.accent}` : undefined, background: c.layout === 'gradient' ? `linear-gradient(145deg, white 70%, ${c.pillBg})` : 'white' }}
    >
      <div className={`h-2 rounded-sm mb-0.5 ${c.layout === 'centered' ? 'w-3/5 self-center' : 'w-3/5'}`} style={{ background: c.accent }} />
      <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
      <div className={`${c.layout === 'dark' ? 'h-2' : c.layout === 'block' ? 'h-1.5' : 'h-px'} my-1`} style={{ background: c.headerBg, opacity: c.layout === 'dark' ? 1 : 0.35 }} />

      <div className="h-1 rounded-sm w-2/5 mb-0.5" style={{ background: c.accent, opacity: 0.6 }} />
      <div className="h-1 bg-gray-200 rounded-sm w-full" />
      <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
      <div className="h-1 bg-gray-200 rounded-sm w-full" />

      <div className="h-1 rounded-sm w-1/3 mt-1 mb-0.5" style={{ background: c.accent, opacity: 0.6 }} />
      <div className="flex gap-1 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-2 rounded-full"
            style={{
              width: `${20 + i * 6}px`,
              background: c.pillBg,
              border: `1px solid ${c.pillBorder}`,
            }}
          />
        ))}
      </div>

      <div className="h-1 rounded-sm w-1/3 mt-1 mb-0.5" style={{ background: c.accent, opacity: 0.6 }} />
      <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
      <div className="h-1 bg-gray-200 rounded-sm w-3/5" />
    </div>
  );
}
