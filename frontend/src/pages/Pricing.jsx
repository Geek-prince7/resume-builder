import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createCheckout, getPlans, getUsage } from '../api';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    Promise.all([getPlans(), getUsage()])
      .then(([plansResponse, usageResponse]) => {
        setPlans(plansResponse.data);
        setCurrentPlan(usageResponse.data.plan.id);
      })
      .catch(() => toast.error('Could not load pricing'));
  }, []);

  const subscribe = async (plan) => {
    if (plan.id === 'free' || plan.id === currentPlan) return;
    setLoadingPlan(plan.id);
    try {
      const response = await createCheckout(plan.id);
      window.location.assign(response.data.url);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not start checkout');
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-900">Simple, usage-safe pricing</h1>
        <p className="mt-3 text-gray-600">
          One AI action is one generation, ATS analysis, or cover letter. Manual edits and PDF downloads do not use quota.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-4">
        {plans.map((plan) => (
          <section
            key={plan.id}
            className={`relative rounded-2xl border bg-white p-6 shadow-sm ${plan.popular ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Best value</span>
            )}
            <h2 className="text-lg font-semibold text-gray-900">{plan.name}</h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ${plan.priceUsd}<span className="text-sm font-normal text-gray-500">/month</span>
            </p>
            <ul className="my-6 space-y-3 text-sm text-gray-600">
              {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <button
              onClick={() => subscribe(plan)}
              disabled={plan.id === currentPlan || !plan.configured || loadingPlan === plan.id}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold ${plan.id === currentPlan ? 'bg-gray-100 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {plan.id === currentPlan ? 'Current plan' : !plan.configured ? 'Coming soon' : loadingPlan === plan.id ? 'Opening checkout…' : 'Choose plan'}
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
