import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getJobDescriptions, getJobTrackerSummary, updateJobApplication } from '../api';

const STATUSES = ['saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn'];
const statusColor = {
  saved: 'bg-gray-100 text-gray-700', applied: 'bg-blue-100 text-blue-700', screening: 'bg-cyan-100 text-cyan-700',
  interviewing: 'bg-amber-100 text-amber-700', offer: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', withdrawn: 'bg-zinc-100 text-zinc-600',
};

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([getJobDescriptions(), getJobTrackerSummary()])
    .then(([jobsRes, summaryRes]) => { setJobs(jobsRes.data); setSummary(summaryRes.data); })
    .finally(() => setLoading(false));
  useEffect(() => { load().catch(() => toast.error('Failed to load job tracker')); }, []);

  const visible = useMemo(() => filter === 'all' ? jobs : jobs.filter((job) => job.applicationStatus === filter), [jobs, filter]);
  const changeStatus = async (job, applicationStatus) => {
    try {
      const response = await updateJobApplication(job._id, { applicationStatus });
      setJobs((current) => current.map((item) => item._id === job._id ? response.data : item));
      const refreshed = await getJobTrackerSummary(); setSummary(refreshed.data);
      toast.success('Application updated');
    } catch { toast.error('Could not update application'); }
  };

  if (loading) return <div className="py-20 text-center text-gray-500">Loading tracker…</div>;
  const cards = [
    ['Total tracked', summary?.total || 0], ['Applied', summary?.applied || 0],
    ['Last 7 days', summary?.appliedLast7Days || 0], ['Last 30 days', summary?.appliedLast30Days || 0], ['Interviews', summary?.byStatus?.interviewing || 0],
    ['Offers', summary?.byStatus?.offer || 0], ['Saved resumes', summary?.resumes || 0],
  ];

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-gray-900">Job application tracker</h1><p className="mt-1 text-sm text-gray-500">Every tailored resume stays attached to its original job.</p></div>
      <Link to="/generate" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add job</Link>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">{cards.map(([label, value]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{label}</p></div>)}</div>
    <div className="flex gap-2 overflow-x-auto pb-1">{['all', ...STATUSES].map((status) => <button key={status} onClick={() => setFilter(status)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium capitalize ${filter === status ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{status}</button>)}</div>
    <div className="space-y-3">{visible.map((job) => <article key={job._id} className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-gray-900">{job.role || 'Untitled role'}{job.company ? ` at ${job.company}` : ''}</h2><span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusColor[job.applicationStatus || 'saved']}`}>{job.applicationStatus || 'saved'}</span></div>
          <p className="mt-1 text-sm text-gray-500">{job.location || 'Location not set'} · {job.generatedResumes?.length || 0} resume version(s){job.appliedAt ? ` · Applied ${new Date(job.appliedAt).toLocaleDateString()}` : ''}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">{job.jobUrl && <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Original posting ↗</a>}{job.generatedResumes?.length > 0 && <Link to={`/resume/${job._id}`} className="text-indigo-600 hover:underline">View resumes</Link>}<Link to={`/connections?job=${job._id}`} className="text-indigo-600 hover:underline">Find referral</Link></div>
        </div>
        <label className="text-xs font-medium text-gray-500">Pipeline stage<select value={job.applicationStatus || 'saved'} onChange={(e) => changeStatus(job, e.target.value)} className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize text-gray-800">{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
      </div>
    </article>)}{visible.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center text-gray-500">No jobs in this stage.</div>}</div>
  </div>;
}
