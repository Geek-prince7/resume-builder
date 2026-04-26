import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';
import { getUser, updateUser, parseResume } from '../api';

const emptyExperience = {
  company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '', highlights: [''],
};
const emptyEducation = {
  institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '', description: '',
};
const emptySkill = { name: '', level: 'intermediate', category: '' };

export default function Profile() {
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '',
    totalExperience: { years: 0, months: 0 },
    linkedinUrl: '', githubUrl: '', behanceUrl: '', portfolioUrl: '',
    summary: '',
    experiences: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    achievements: [''],
  });

  useEffect(() => {
    getUser()
      .then((res) => {
        const u = res.data;
        setForm({
          name: u.name || '', phone: u.phone || '',
          totalExperience: u.totalExperience || { years: 0, months: 0 },
          linkedinUrl: u.linkedinUrl || '', githubUrl: u.githubUrl || '',
          behanceUrl: u.behanceUrl || '', portfolioUrl: u.portfolioUrl || '',
          summary: u.summary || '',
          experiences: u.experiences?.length ? u.experiences : [],
          education: u.education?.length ? u.education : [],
          skills: u.skills?.length ? u.skills : [],
          certifications: u.certifications || [],
          projects: u.projects || [],
          languages: u.languages || [],
          achievements: u.achievements?.length ? u.achievements : [''],
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        achievements: form.achievements.filter((a) => a.trim()),
      };
      const res = await updateUser(payload);
      refreshUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleParseResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const res = await parseResume(file);
      const u = res.data.user;
      setForm({
        name: u.name || form.name, phone: u.phone || form.phone,
        totalExperience: u.totalExperience || form.totalExperience,
        linkedinUrl: u.linkedinUrl || form.linkedinUrl, githubUrl: u.githubUrl || form.githubUrl,
        behanceUrl: u.behanceUrl || form.behanceUrl, portfolioUrl: u.portfolioUrl || form.portfolioUrl,
        summary: u.summary || form.summary,
        experiences: u.experiences?.length ? u.experiences : form.experiences,
        education: u.education?.length ? u.education : form.education,
        skills: u.skills?.length ? u.skills : form.skills,
        certifications: u.certifications?.length ? u.certifications : form.certifications,
        projects: u.projects?.length ? u.projects : form.projects,
        languages: u.languages?.length ? u.languages : form.languages,
        achievements: u.achievements?.length ? u.achievements : form.achievements,
      });
      refreshUser(u);
      toast.success('Resume parsed and profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to parse resume');
    } finally {
      setParsing(false);
    }
  };

  const updateArrayItem = (field, index, key, value) => {
    setForm((f) => {
      const arr = [...f[field]];
      arr[index] = { ...arr[index], [key]: value };
      return { ...f, [field]: arr };
    });
  };

  const addArrayItem = (field, template) => {
    setForm((f) => ({ ...f, [field]: [...f[field], { ...template }] }));
  };

  const removeArrayItem = (field, index) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <label className="cursor-pointer px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          {parsing ? 'Parsing...' : 'Upload & Parse Resume'}
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleParseResume}
            className="hidden"
            disabled={parsing}
          />
        </label>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name *" value={form.name} onChange={(v) => setField('name', v)} />
            <Input label="Phone" value={form.phone} onChange={(v) => setField('phone', v)} />
            <div className="flex gap-3">
              <Input label="Exp Years" type="number" value={form.totalExperience.years}
                onChange={(v) => setField('totalExperience', { ...form.totalExperience, years: Number(v) })} />
              <Input label="Exp Months" type="number" value={form.totalExperience.months}
                onChange={(v) => setField('totalExperience', { ...form.totalExperience, months: Number(v) })} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Links & Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="LinkedIn URL" value={form.linkedinUrl} onChange={(v) => setField('linkedinUrl', v)} />
            <Input label="GitHub URL" value={form.githubUrl} onChange={(v) => setField('githubUrl', v)} />
            <Input label="Behance URL" value={form.behanceUrl} onChange={(v) => setField('behanceUrl', v)} />
            <Input label="Portfolio URL" value={form.portfolioUrl} onChange={(v) => setField('portfolioUrl', v)} />
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h2>
          <textarea
            value={form.summary}
            onChange={(e) => setField('summary', e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Brief professional summary..."
          />
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
            <button type="button" onClick={() => addArrayItem('experiences', emptyExperience)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              + Add Experience
            </button>
          </div>
          {form.experiences.map((exp, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Experience #{i + 1}</span>
                <button type="button" onClick={() => removeArrayItem('experiences', i)}
                  className="text-sm text-red-500 hover:text-red-700">Remove</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Company" value={exp.company} onChange={(v) => updateArrayItem('experiences', i, 'company', v)} />
                <Input label="Role" value={exp.role} onChange={(v) => updateArrayItem('experiences', i, 'role', v)} />
                <Input label="Location" value={exp.location} onChange={(v) => updateArrayItem('experiences', i, 'location', v)} />
                <Input label="Start Date" type="date" value={exp.startDate?.slice(0, 10) || ''} onChange={(v) => updateArrayItem('experiences', i, 'startDate', v)} />
                <Input label="End Date" type="date" value={exp.endDate?.slice(0, 10) || ''} onChange={(v) => updateArrayItem('experiences', i, 'endDate', v)}
                  disabled={exp.current} />
                <label className="flex items-center gap-2 text-sm text-gray-700 self-end pb-2">
                  <input type="checkbox" checked={exp.current} onChange={(e) => updateArrayItem('experiences', i, 'current', e.target.checked)}
                    className="rounded border-gray-300" /> Currently working here
                </label>
              </div>
              <textarea value={exp.description || ''} onChange={(e) => updateArrayItem('experiences', i, 'description', e.target.value)}
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Role description..." rows={2} />
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Key Highlights (one per line)</label>
                <textarea
                  value={(exp.highlights || []).join('\n')}
                  onChange={(e) => updateArrayItem('experiences', i, 'highlights', e.target.value.split('\n'))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Built X that improved Y by Z%..." rows={3} />
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Education</h2>
            <button type="button" onClick={() => addArrayItem('education', emptyEducation)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              + Add Education
            </button>
          </div>
          {form.education.map((edu, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Education #{i + 1}</span>
                <button type="button" onClick={() => removeArrayItem('education', i)}
                  className="text-sm text-red-500 hover:text-red-700">Remove</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Institution" value={edu.institution} onChange={(v) => updateArrayItem('education', i, 'institution', v)} />
                <Input label="Degree" value={edu.degree} onChange={(v) => updateArrayItem('education', i, 'degree', v)} />
                <Input label="Field of Study" value={edu.field || ''} onChange={(v) => updateArrayItem('education', i, 'field', v)} />
                <Input label="Grade / GPA" value={edu.grade || ''} onChange={(v) => updateArrayItem('education', i, 'grade', v)} />
                <Input label="Start Date" type="date" value={edu.startDate?.slice(0, 10) || ''} onChange={(v) => updateArrayItem('education', i, 'startDate', v)} />
                <Input label="End Date" type="date" value={edu.endDate?.slice(0, 10) || ''} onChange={(v) => updateArrayItem('education', i, 'endDate', v)} />
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
            <button type="button" onClick={() => addArrayItem('skills', emptySkill)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              + Add Skill
            </button>
          </div>
          {form.skills.map((skill, i) => (
            <div key={i} className="flex gap-3 items-end mb-3">
              <Input label="Skill" value={skill.name} onChange={(v) => updateArrayItem('skills', i, 'name', v)} />
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                <select value={skill.level} onChange={(e) => updateArrayItem('skills', i, 'level', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <Input label="Category" value={skill.category || ''} onChange={(v) => updateArrayItem('skills', i, 'category', v)} />
              <button type="button" onClick={() => removeArrayItem('skills', i)}
                className="text-red-500 hover:text-red-700 pb-2 text-sm">Remove</button>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
          {form.achievements.map((ach, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={ach} onChange={(e) => {
                const arr = [...form.achievements];
                arr[i] = e.target.value;
                setField('achievements', arr);
              }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Achievement..." />
              <button type="button" onClick={() => setField('achievements', form.achievements.filter((_, idx) => idx !== i))}
                className="text-red-500 hover:text-red-700 text-sm">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setField('achievements', [...form.achievements, ''])}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2">
            + Add Achievement
          </button>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', disabled = false }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100" />
    </div>
  );
}
