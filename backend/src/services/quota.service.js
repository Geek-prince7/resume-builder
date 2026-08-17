const User = require('../models/User');
const UsageEvent = require('../models/UsageEvent');
const { getPlan } = require('../config/plans');

function nextMonth(from = new Date()) {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1));
}

async function ensureUsagePeriod(user) {
  const now = new Date();
  if (!user.usage?.periodEnd || user.usage.periodEnd <= now) {
    user.usage = {
      periodStart: now,
      periodEnd: user.billing?.currentPeriodEnd > now ? user.billing.currentPeriodEnd : nextMonth(now),
      aiActionsUsed: 0,
      resumeParsesUsed: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
    };
    await user.save();
  }
  return user;
}

async function getUsageSummary(user) {
  await ensureUsagePeriod(user);
  const plan = getPlan(user.billing?.plan);
  return {
    plan,
    subscription: user.billing,
    usage: user.usage,
    remaining: {
      aiActions: Math.max(0, plan.monthlyAiActions - user.usage.aiActionsUsed),
      resumeParses: Math.max(0, plan.monthlyResumeParses - user.usage.resumeParsesUsed),
      tokens: Math.max(0, plan.monthlyTokens - user.usage.inputTokens - user.usage.outputTokens),
    },
  };
}

async function reserveQuota(userId, operation, referenceId) {
  const user = await User.findOne({ userId });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  await ensureUsagePeriod(user);

  const plan = getPlan(user.billing?.plan);
  const isParse = operation === 'resume_parse';
  const tokensUsed = user.usage.inputTokens + user.usage.outputTokens;
  if (!isParse && tokensUsed >= plan.monthlyTokens) {
    const error = new Error('Your monthly AI token quota is exhausted');
    error.status = 402;
    error.code = 'TOKEN_QUOTA_EXCEEDED';
    error.details = { plan: plan.id, used: tokensUsed, limit: plan.monthlyTokens, periodEnd: user.usage.periodEnd };
    throw error;
  }
  const usedField = isParse ? 'usage.resumeParsesUsed' : 'usage.aiActionsUsed';
  const limit = isParse ? plan.monthlyResumeParses : plan.monthlyAiActions;
  const current = isParse ? user.usage.resumeParsesUsed : user.usage.aiActionsUsed;
  if (current >= limit) {
    const error = new Error(`Your ${isParse ? 'resume import' : 'AI action'} quota is exhausted`);
    error.status = 402;
    error.code = 'QUOTA_EXCEEDED';
    error.details = { plan: plan.id, used: current, limit, periodEnd: user.usage.periodEnd };
    throw error;
  }

  const updated = await User.findOneAndUpdate(
    { userId, [usedField]: { $lt: limit } },
    { $inc: { [usedField]: 1 } },
    { new: true }
  );
  if (!updated) {
    const error = new Error('Quota was consumed by another request');
    error.status = 402;
    error.code = 'QUOTA_EXCEEDED';
    throw error;
  }

  const event = await UsageEvent.create({ userId, operation, referenceId, status: 'reserved' });
  return event;
}

async function completeQuota(event, usage = {}) {
  const inputTokens = Number(usage.inputTokens || 0);
  const outputTokens = Number(usage.outputTokens || 0);
  const estimatedCostUsd = Number(usage.estimatedCostUsd || 0);
  await Promise.all([
    UsageEvent.findByIdAndUpdate(event._id, {
      status: 'completed',
      provider: usage.provider,
      model: usage.model,
      inputTokens,
      outputTokens,
      estimatedCostUsd,
      metadata: usage.metadata,
    }),
    User.findOneAndUpdate(
      { userId: event.userId },
      { $inc: { 'usage.inputTokens': inputTokens, 'usage.outputTokens': outputTokens, 'usage.estimatedCostUsd': estimatedCostUsd } }
    ),
  ]);
}

async function releaseQuota(event) {
  const isParse = event.operation === 'resume_parse';
  const field = isParse ? 'usage.resumeParsesUsed' : 'usage.aiActionsUsed';
  await Promise.all([
    UsageEvent.findByIdAndUpdate(event._id, { status: 'failed' }),
    User.findOneAndUpdate({ userId: event.userId, [field]: { $gt: 0 } }, { $inc: { [field]: -1 } }),
  ]);
}

module.exports = { getUsageSummary, reserveQuota, completeQuota, releaseQuota, ensureUsagePeriod };
