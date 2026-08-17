import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDiscoverySummary, getMatchingCompanies, getRecommendations, refreshRecommendationMatches, runJobDiscovery, updateRecommendation } from '../api';

export default function Opportunities() {
  const [recommendations, setRecommendations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('new');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [recommendationRes, companyRes, summaryRes] = await Promise.all([getRecommendations({ status }), getMatchingCompanies(), getDiscoverySummary()]);
    setRecommendations(recommendationRes.data); setCompanies(companyRes.data); setSummary(summaryRes.data);
  };
  useEffect(() => { setLoading(true); load().catch(() => toast.error('Could not load opportunities')).finally(() => setLoading(false)); }, [status]);

  const update = async (id, nextStatus) => {
    try { await updateRecommendation(id, nextStatus); toast.success(nextStatus === 'saved' ? 'Added to your job tracker' : 'Recommendation updated'); await load(); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not update recommendation'); }
  };
  const refresh = async () => {
    try { const response = await refreshRecommendationMatches(); toast.success(`${response.data.matched} opportunities matched`); await load(); }
    catch { toast.error('Could not refresh matches'); }
  };
  const discover = async () => {
    try { await runJobDiscovery(); toast.success('Discovery queued. New jobs will appear shortly.'); }
    catch { toast.error('Could not start discovery'); }
  };

  const cards = [['Recommended', summary?.byStatus?.new || 0], ['Saved', summary?.byStatus?.saved || 0], ['Applied', summary?.byStatus?.applied || 0], ['Average match', `${summary?.averageScore || 0}%`], ['Matching companies', companies.length]];
  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">Opportunity discovery</h1><p className="mt-1 text-sm text-gray-500">Fresh jobs from configured, permitted sources matched against your target market.</p></div><div className="flex gap-2"><button onClick={discover} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Run discovery</button><button onClick={refresh} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Refresh my matches</button></div></header>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{cards.map(([label, value]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{label}</p></div>)}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2">{['new', 'saved', 'applied', 'dismissed', 'all'].map((item) => <button key={item} onClick={() => setStatus(item)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${status === item ? 'bg-indigo-600 text-white' : 'border border-gray-200 bg-white text-gray-600'}`}>{item}</button>)}</div><Link to="/profile" className="text-sm font-medium text-indigo-600">Edit target market →</Link></div>
    {loading ? <div className="py-16 text-center text-gray-500">Loading opportunities…</div> : <div className="space-y-3">{recommendations.map((recommendation) => {
      const job = recommendation.jobId; const company = recommendation.companyId;
      return <article key={recommendation._id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-gray-900">{job.title} at {job.companyName}</h2><span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">{recommendation.score}% match</span></div><p className="mt-1 text-sm text-gray-500">{job.location || job.country || 'Location unspecified'} · {company?.companyType?.replaceAll('_', ' ') || 'Company type unclassified'} · {job.source}</p><div className="mt-3 flex flex-wrap gap-2">{recommendation.reasons.map((reason) => <span key={reason} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">{reason}</span>)}</div></div><div className="flex items-start gap-2"><a href={job.jobUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">View job ↗</a>{recommendation.status !== 'saved' && <button onClick={() => update(recommendation._id, 'saved')} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white">Save & tailor</button>}{recommendation.status === 'new' && <button onClick={() => update(recommendation._id, 'dismissed')} className="rounded-lg px-3 py-2 text-sm text-gray-500">Dismiss</button>}</div></div></article>;
    })}{!recommendations.length && <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center"><p className="font-medium text-gray-700">No opportunities in this view yet.</p><p className="mt-1 text-sm text-gray-500">Set target countries and roles in your profile, then run discovery or refresh matching.</p></div>}</div>}
    {companies.length > 0 && <section><h2 className="mb-3 text-lg font-semibold text-gray-900">Companies matching your market</h2><div className="grid gap-3 md:grid-cols-3">{companies.slice(0, 12).map((company) => <div key={company._id} className="rounded-xl border border-gray-200 bg-white p-4"><p className="font-medium text-gray-900">{company.name}</p><p className="mt-1 text-xs text-gray-500">{company.country} · {company.companyType?.replaceAll('_', ' ') || 'Unclassified'} · {company.activeJobCount} open roles</p>{company.careersUrl && <a href={company.careersUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-indigo-600">Careers page ↗</a>}</div>)}</div></section>}
  </div>;
}
