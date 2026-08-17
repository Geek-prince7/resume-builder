import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createConnection, deleteConnection, getConnections, getJobDescriptions, updateConnection } from '../api';

const empty = { contactName: '', company: '', role: '', profileUrl: '', jobDescriptionId: '', requestType: 'referral', notes: '' };
const copy = async (value) => { await navigator.clipboard.writeText(value || ''); toast.success('Message copied'); };

export default function Connections() {
  const [params] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ ...empty, jobDescriptionId: params.get('job') || '' });
  const [saving, setSaving] = useState(false);
  const load = () => Promise.all([getConnections(), getJobDescriptions()]).then(([connections, jobList]) => { setRecords(connections.data); setJobs(jobList.data); });
  useEffect(() => { load().catch(() => toast.error('Failed to load referral tracker')); }, []);
  const due = useMemo(() => records.filter((item) => item.status === 'sent' && item.followUpAt && new Date(item.followUpAt) <= new Date()).length, [records]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    try { await createConnection(form); setForm(empty); await load(); toast.success('Contact added with personalized drafts'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not add contact'); }
    finally { setSaving(false); }
  };
  const update = async (id, data) => { const response = await updateConnection(id, data); setRecords((current) => current.map((item) => item._id === id ? response.data : item)); };

  return <div className="space-y-7">
    <div><h1 className="text-2xl font-bold text-gray-900">Referrals & connections</h1><p className="mt-1 text-sm text-gray-500">Prepare drafts and reminders here; review and send every message yourself.</p></div>
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border bg-white p-4"><p className="text-2xl font-bold">{records.length}</p><p className="text-xs text-gray-500">Contacts tracked</p></div><div className="rounded-xl border bg-white p-4"><p className="text-2xl font-bold">{records.filter((r) => r.status === 'accepted').length}</p><p className="text-xs text-gray-500">Accepted</p></div><div className="rounded-xl border bg-white p-4"><p className="text-2xl font-bold text-amber-600">{due}</p><p className="text-xs text-gray-500">Follow-ups due</p></div></div>
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="mb-4 font-semibold">Add a contact</h2><div className="grid gap-4 md:grid-cols-2">
      <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Contact name *" className="rounded-lg border px-3 py-2 text-sm" />
      <input type="url" value={form.profileUrl} onChange={(e) => setForm({ ...form, profileUrl: e.target.value })} placeholder="Profile URL" className="rounded-lg border px-3 py-2 text-sm" />
      <select value={form.jobDescriptionId} onChange={(e) => { const job = jobs.find((item) => item._id === e.target.value); setForm({ ...form, jobDescriptionId: e.target.value, company: job?.company || form.company, role: job?.role || form.role }); }} className="rounded-lg border px-3 py-2 text-sm"><option value="">Link to a tracked job</option>{jobs.map((job) => <option key={job._id} value={job._id}>{job.role || 'Role'}{job.company ? ` at ${job.company}` : ''}</option>)}</select>
      <select value={form.requestType} onChange={(e) => setForm({ ...form, requestType: e.target.value })} className="rounded-lg border px-3 py-2 text-sm"><option value="connection">Connection</option><option value="referral">Referral</option><option value="informational">Informational chat</option></select>
      <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="rounded-lg border px-3 py-2 text-sm" />
      <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Target role" className="rounded-lg border px-3 py-2 text-sm" />
    </div><button disabled={saving} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Adding…' : 'Add and prepare drafts'}</button></form>
    <div className="space-y-4">{records.map((record) => <article key={record._id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{record.contactName}{record.company ? ` · ${record.company}` : ''}</h2><p className="text-xs capitalize text-gray-500">{record.requestType} · {record.status}{record.followUpAt ? ` · Follow up ${new Date(record.followUpAt).toLocaleDateString()}` : ''}</p></div><div className="flex gap-2">{record.profileUrl && <a href={record.profileUrl} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-xs">Open profile ↗</a>}<select value={record.status} onChange={(e) => update(record._id, { status: e.target.value })} className="rounded-lg border px-2 py-1 text-xs capitalize">{['planned', 'sent', 'accepted', 'declined', 'no_response'].map((status) => <option key={status}>{status}</option>)}</select><button onClick={async () => { await deleteConnection(record._id); setRecords((current) => current.filter((item) => item._id !== record._id)); }} className="text-xs text-red-600">Delete</button></div></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{[['Connection note', 'connectionMessage'], ['After acceptance', 'welcomeMessage'], ['Referral request', 'referralMessage'], ['One follow-up', 'followUpMessage']].map(([label, key]) => <div key={key} className="rounded-lg bg-gray-50 p-3"><div className="mb-2 flex justify-between"><span className="text-xs font-semibold text-gray-500">{label}</span><button onClick={() => copy(record[key])} className="text-xs font-medium text-indigo-600">Copy</button></div><p className="text-sm leading-6 text-gray-700">{record[key]}</p></div>)}</div>
    </article>)}{records.length === 0 && <div className="rounded-xl border border-dashed bg-white py-12 text-center text-gray-500">Add your first referral contact.</div>}</div>
  </div>;
}
