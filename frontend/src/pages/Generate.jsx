import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTemplates, createJobDescription, generateResume } from '../api';
import AdSlot from '../components/AdSlot';

export default function Generate() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getTemplates()
      .then((res) => {
        setTemplates(res.data);
        if (res.data.length > 0) setSelectedTemplate(res.data[0].id);
      })
      .catch(() => toast.error('Failed to load templates'));
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
      const jdRes = await createJobDescription({ company, role, description });
      const jdId = jdRes.data._id;

      await generateResume(jdId, selectedTemplate);
      toast.success('Resume generated!');
      navigate(`/resume/${jdId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
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
          </div>
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
        </section>

        <AdSlot
          slot={import.meta.env.VITE_ADSENSE_SLOT_GENERATE}
          className="bg-white rounded-lg border border-gray-200 p-2"
          minHeight={120}
        />

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {templates.map((tpl) => (
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
                <p className="font-semibold text-gray-900 text-sm">{tpl.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{tpl.description}</p>
              </button>
            ))}
          </div>
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

function TemplatePreview({ id, selected }) {
  const configs = {
    classic:   { accent: '#1a1a1a', headerBg: '#1a1a1a', pillBg: '#f5f5f5', pillBorder: '#ddd' },
    modern:    { accent: '#3b82f6', headerBg: '#3b82f6', pillBg: '#eff6ff', pillBorder: '#dbeafe' },
    minimal:   { accent: '#a1a1aa', headerBg: '#e4e4e7', pillBg: '#fafafa', pillBorder: '#e4e4e7' },
    executive: { accent: '#292524', headerBg: '#292524', pillBg: '#fafaf9', pillBorder: '#e7e5e4' },
    creative:  { accent: '#6366f1', headerBg: '#6366f1', pillBg: '#eef2ff', pillBorder: '#e0e7ff' },
  };
  const c = configs[id] || configs.classic;

  return (
    <div
      className="w-full h-full bg-white rounded-md p-2.5 flex flex-col gap-1 transition-transform group-hover:scale-[1.02]"
      style={{ borderTop: `3px solid ${c.accent}` }}
    >
      <div className="h-2 rounded-sm w-3/5 mb-0.5" style={{ background: c.accent }} />
      <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
      <div className="h-px my-1" style={{ background: c.headerBg, opacity: 0.2 }} />

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
