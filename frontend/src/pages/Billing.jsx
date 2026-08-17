import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createBillingPortal, getUsage } from '../api';

function Meter({ label, used, limit }) {
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm"><span>{label}</span><span>{used} / {limit}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function Billing() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getUsage().then((response) => setSummary(response.data)).catch(() => toast.error('Could not load usage'));
  }, []);

  const openPortal = async () => {
    try {
      const response = await createBillingPortal();
      window.location.assign(response.data.url);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not open billing portal');
    }
  };

  if (!summary) return <div className="py-20 text-center text-gray-500">Loading usage…</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Billing & usage</h1><p className="mt-1 text-gray-500">Current plan: {summary.plan.name}</p></div>
        {summary.plan.id === 'free' ? (
          <Link to="/pricing" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Upgrade</Link>
        ) : (
          <button onClick={openPortal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Manage subscription</button>
        )}
      </div>
      <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <Meter label="AI actions" used={summary.usage.aiActionsUsed} limit={summary.plan.monthlyAiActions} />
        <Meter label="Resume imports" used={summary.usage.resumeParsesUsed} limit={summary.plan.monthlyResumeParses} />
        <div className="grid grid-cols-2 gap-4 border-t pt-5 text-sm text-gray-600">
          <div><span className="block text-xs uppercase text-gray-400">Tokens used</span>{(summary.usage.inputTokens + summary.usage.outputTokens).toLocaleString()}</div>
          <div><span className="block text-xs uppercase text-gray-400">Resets</span>{new Date(summary.usage.periodEnd).toLocaleDateString()}</div>
        </div>
      </section>
    </div>
  );
}
