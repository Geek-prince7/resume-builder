const PLANS = Object.freeze({
  free: {
    id: 'free',
    name: 'Free',
    priceUsd: 0,
    monthlyAiActions: 3,
    monthlyResumeParses: 2,
    monthlyTokens: 30000,
    maxSavedResumes: 3,
    features: ['3 AI actions per month', '2 resume imports', 'Basic templates', 'PDF export'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceUsd: 9,
    monthlyAiActions: 30,
    monthlyResumeParses: 10,
    monthlyTokens: 300000,
    maxSavedResumes: 30,
    stripePriceEnv: 'STRIPE_PRICE_STARTER',
    features: ['30 AI actions per month', '10 resume imports', 'All templates', 'Revision history'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceUsd: 19,
    monthlyAiActions: 100,
    monthlyResumeParses: 30,
    monthlyTokens: 1000000,
    maxSavedResumes: 150,
    stripePriceEnv: 'STRIPE_PRICE_PRO',
    popular: true,
    features: ['100 AI actions per month', '30 resume imports', 'ATS reports', 'Cover letters', 'Priority models'],
  },
  career: {
    id: 'career',
    name: 'Career',
    priceUsd: 39,
    monthlyAiActions: 250,
    monthlyResumeParses: 75,
    monthlyTokens: 2500000,
    maxSavedResumes: 500,
    stripePriceEnv: 'STRIPE_PRICE_CAREER',
    features: ['250 AI actions per month', '75 resume imports', 'Multiple profile variants', 'Highest limits'],
  },
});

function getPlan(planId = 'free') {
  return PLANS[planId] || PLANS.free;
}

function publicPlans() {
  return Object.values(PLANS).map(({ stripePriceEnv, ...plan }) => ({
    ...plan,
    configured: plan.priceUsd === 0 || Boolean(process.env[stripePriceEnv]),
  }));
}

function planFromStripePrice(priceId) {
  return Object.values(PLANS).find(
    (plan) => plan.stripePriceEnv && process.env[plan.stripePriceEnv] === priceId
  );
}

module.exports = { PLANS, getPlan, publicPlans, planFromStripePrice };
