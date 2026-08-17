import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { restoreGeneratedResumeRevision, updateGeneratedResume } from '../api';

const clone = (value) => JSON.parse(JSON.stringify(value || {}));

export default function ResumeEditor({ jdId, resume, onSaved, onClose }) {
  const [draft, setDraft] = useState(() => clone(resume.content));
  const [saving, setSaving] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    setDraft(clone(resume.content));
  }, [resume]);

  const updateHighlight = (experienceIndex, highlightIndex, value) => {
    setDraft((current) => {
      const next = clone(current);
      next.experiences[experienceIndex].highlights[highlightIndex] = value;
      return next;
    });
  };

  const addHighlight = (experienceIndex) => {
    setDraft((current) => {
      const next = clone(current);
      next.experiences[experienceIndex].highlights = [
        ...(next.experiences[experienceIndex].highlights || []),
        '',
      ];
      return next;
    });
  };

  const removeHighlight = (experienceIndex, highlightIndex) => {
    setDraft((current) => {
      const next = clone(current);
      next.experiences[experienceIndex].highlights.splice(highlightIndex, 1);
      return next;
    });
  };

  const updateSkill = (skillIndex, field, value) => {
    setDraft((current) => {
      const next = clone(current);
      next.skills[skillIndex] = { ...next.skills[skillIndex], [field]: value };
      return next;
    });
  };

  const addSkill = () => {
    setDraft((current) => ({
      ...current,
      skills: [...(current.skills || []), { name: '', category: 'Other' }],
    }));
  };

  const removeSkill = (skillIndex) => {
    setDraft((current) => ({
      ...current,
      skills: (current.skills || []).filter((_, index) => index !== skillIndex),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await updateGeneratedResume(jdId, resume._id, draft);
      onSaved(response.data);
      toast.success('Resume saved and previous version preserved');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not save resume');
    } finally {
      setSaving(false);
    }
  };

  const restore = async (revisionId) => {
    setRestoringId(revisionId);
    try {
      const response = await restoreGeneratedResumeRevision(jdId, resume._id, revisionId);
      onSaved(response.data);
      setDraft(clone(response.data.content));
      toast.success('Revision restored');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not restore revision');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Edit resume</h2>
          <p className="text-sm text-gray-500">Saving automatically preserves the current version.</p>
        </div>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">Close</button>
      </div>

      <label className="mb-5 block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700">Professional summary</span>
        <textarea
          rows={5}
          value={draft.summary || ''}
          onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </label>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Experience bullet points</h3>
        <div className="space-y-5">
          {(draft.experiences || []).map((experience, experienceIndex) => (
            <div key={`${experience.company}-${experienceIndex}`} className="rounded-lg border border-gray-200 p-4">
              <p className="mb-3 text-sm font-medium text-gray-800">
                {experience.role} {experience.company ? `— ${experience.company}` : ''}
              </p>
              <div className="space-y-2">
                {(experience.highlights || []).map((highlight, highlightIndex) => (
                  <div key={highlightIndex} className="flex gap-2">
                    <textarea
                      rows={2}
                      value={highlight}
                      onChange={(event) => updateHighlight(experienceIndex, highlightIndex, event.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={() => removeHighlight(experienceIndex, highlightIndex)}
                      className="self-start px-2 py-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addHighlight(experienceIndex)} className="mt-2 text-sm font-medium text-indigo-600">
                + Add bullet
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Skills</h3>
          <button onClick={addSkill} className="text-sm font-medium text-indigo-600">+ Add skill</button>
        </div>
        <div className="space-y-2">
          {(draft.skills || []).map((skill, skillIndex) => (
            <div key={skillIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={skill.name || ''}
                onChange={(event) => updateSkill(skillIndex, 'name', event.target.value)}
                placeholder="Skill"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                value={skill.category || ''}
                onChange={(event) => updateSkill(skillIndex, 'category', event.target.value)}
                placeholder="Category"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button onClick={() => removeSkill(skillIndex)} className="px-2 text-sm text-red-600">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {(resume.revisions || []).length > 0 && (
        <div className="mb-6 border-t border-gray-200 pt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Revision history</h3>
          <div className="space-y-2">
            {[...resume.revisions].reverse().map((revision, index) => (
              <div key={revision._id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-600">
                  Version {resume.revisions.length - index} · {new Date(revision.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={() => restore(revision._id)}
                  disabled={restoringId === revision._id}
                  className="text-sm font-medium text-indigo-600 disabled:opacity-50"
                >
                  {restoringId === revision._id ? 'Restoring…' : 'Restore'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">Cancel</button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
