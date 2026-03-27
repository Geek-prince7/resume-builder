import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';
import { getJobDescription } from '../api';

export default function ResumePreview() {
  const { jdId } = useParams();
  const { userId } = useUser();
  const [jd, setJd] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!userId || !jdId) return;
    getJobDescription(userId, jdId)
      .then((res) => setJd(res.data))
      .catch(() => toast.error('Failed to load resume'))
      .finally(() => setLoading(false));
  }, [userId, jdId]);

  const handleDownload = async () => {
    const html = jd.generatedResumes[activeIdx]?.htmlContent;
    if (!html) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      await html2pdf()
        .set({
          margin: 0,
          filename: `resume-${jd.role || 'tailored'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        })
        .from(container)
        .save();

      document.body.removeChild(container);
    } catch {
      toast.error('PDF download failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!jd || !jd.generatedResumes?.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">No generated resume found.</p>
        <Link to="/generate" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Generate one
        </Link>
      </div>
    );
  }

  const active = jd.generatedResumes[activeIdx];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {jd.role || 'Resume'}{jd.company ? ` — ${jd.company}` : ''}
          </h1>
          {active.score != null && (
            <p className="text-sm text-gray-500 mt-1">
              Match Score:{' '}
              <span
                className={`font-semibold ${
                  active.score >= 70 ? 'text-green-600' : active.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}
              >
                {active.score}%
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            to="/generate"
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Generate Another
          </Link>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      {jd.generatedResumes.length > 1 && (
        <div className="flex gap-2 mb-4">
          {jd.generatedResumes.map((r, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                i === activeIdx
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r.templateId} template
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <iframe
          ref={iframeRef}
          srcDoc={active.htmlContent}
          title="Resume Preview"
          className="w-full border-0"
          style={{ height: '1100px' }}
        />
      </div>
    </div>
  );
}
