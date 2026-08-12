import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { getJobDescription } from '../api';
import ResumeDocument from '../components/templates/ResumeDocument';
import ResumeEditor from '../components/ResumeEditor';
import AdSlot from '../components/AdSlot';

export default function ResumePreview() {
  const { jdId } = useParams();
  const [jd, setJd] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const resumeRef = useRef(null);

  const sanitize = (value, fallback) =>
    (value || fallback)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || fallback;

  const pdfFileName = [
    sanitize(jd?.generatedResumes?.[activeIdx]?.content?.name, 'username'),
    sanitize(jd?.role, 'position'),
    sanitize(jd?.company, 'company'),
  ].join('_');

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: pdfFileName,
  });

  useEffect(() => {
    if (!jdId) return;
    getJobDescription(jdId)
      .then((res) => setJd(res.data))
      .catch(() => toast.error('Failed to load resume'))
      .finally(() => setLoading(false));
  }, [jdId]);

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

  const handleResumeSaved = (savedResume) => {
    setJd((current) => ({
      ...current,
      generatedResumes: current.generatedResumes.map((resume) =>
        resume._id === savedResume._id ? savedResume : resume
      ),
    }));
  };

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
          <button
            onClick={() => setEditing((value) => !value)}
            className="px-4 py-2 text-sm border border-indigo-300 rounded-lg text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            {editing ? 'Close Editor' : 'Edit Resume'}
          </button>
          <Link
            to="/generate"
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Generate Another
          </Link>
          <button
            onClick={handlePrint}
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
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors capitalize ${
                i === activeIdx
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r.templateId}
            </button>
          ))}
        </div>
      )}

      {editing && (
        <ResumeEditor
          jdId={jdId}
          resume={active}
          onSaved={handleResumeSaved}
          onClose={() => setEditing(false)}
        />
      )}

      <AdSlot
        slot={import.meta.env.VITE_ADSENSE_SLOT_PREVIEW}
        className="bg-white rounded-lg border border-gray-200 p-2 mb-4"
        minHeight={120}
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <ResumeDocument
          ref={resumeRef}
          content={active.content}
          templateId={active.templateId}
        />
      </div>
    </div>
  );
}
