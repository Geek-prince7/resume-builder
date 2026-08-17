const axios = require('axios');
const Company = require('../models/Company');
const DiscoveredJob = require('../models/DiscoveredJob');
const JobRecommendation = require('../models/JobRecommendation');
const User = require('../models/User');
const { logger } = require('../logger');

const HTTP_TIMEOUT_MS = Number(process.env.DISCOVERY_REQUEST_TIMEOUT_MS || 15000);
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim();
const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function configuredSources() {
  try {
    const parsed = JSON.parse(process.env.DISCOVERY_SOURCES_JSON || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => item?.name && item?.slug && ['greenhouse', 'lever'].includes(item?.source)) : [];
  } catch (error) {
    logger.error('Invalid DISCOVERY_SOURCES_JSON', { error: error.message });
    return [];
  }
}

async function syncConfiguredCompanies() {
  const sources = configuredSources();
  await Promise.all(sources.map((source) => Company.findOneAndUpdate(
    { source: source.source, slug: source.slug },
    { $set: { ...source, country: source.country?.toUpperCase(), enabled: true } },
    { upsert: true, new: true, runValidators: true }
  )));
  return sources.length;
}

async function fetchGreenhouse(company) {
  const { data } = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(company.slug)}/jobs`, {
    params: { content: true }, timeout: HTTP_TIMEOUT_MS,
  });
  return (data.jobs || []).map((job) => ({
    externalId: String(job.id), source: 'greenhouse', title: job.title,
    description: stripHtml(job.content), location: job.location?.name || '', country: company.country,
    workMode: /remote/i.test(job.location?.name || '') ? 'remote' : 'unspecified',
    jobUrl: job.absolute_url, applyUrl: job.absolute_url,
    departments: (job.departments || []).map((item) => item.name), publishedAt: job.updated_at,
  }));
}

async function fetchLever(company) {
  const { data } = await axios.get(`https://api.lever.co/v0/postings/${encodeURIComponent(company.slug)}`, {
    params: { mode: 'json' }, timeout: HTTP_TIMEOUT_MS,
  });
  return (data || []).map((job) => ({
    externalId: String(job.id), source: 'lever', title: job.text,
    description: stripHtml(job.descriptionPlain || job.description), location: job.categories?.location || '', country: company.country,
    workMode: ['remote', 'hybrid', 'on-site'].includes(job.workplaceType) ? job.workplaceType.replace('on-site', 'onsite') : 'unspecified',
    jobUrl: job.hostedUrl, applyUrl: job.applyUrl,
    departments: [job.categories?.department, job.categories?.team].filter(Boolean),
    publishedAt: job.createdAt ? new Date(job.createdAt) : undefined,
  }));
}

async function ingestCompany(company) {
  const fetchedAt = new Date();
  const jobs = company.source === 'greenhouse' ? await fetchGreenhouse(company) : await fetchLever(company);
  const seenIds = jobs.map((job) => job.externalId);
  if (jobs.length) {
    await DiscoveredJob.bulkWrite(jobs.map((job) => ({
      updateOne: {
        filter: { source: job.source, externalId: job.externalId },
        update: { $set: { ...job, companyId: company._id, companyName: company.name, lastSeenAt: fetchedAt, active: true } },
        upsert: true,
      },
    })));
  }
  await DiscoveredJob.updateMany(
    { companyId: company._id, active: true, ...(seenIds.length ? { externalId: { $nin: seenIds } } : {}) },
    { $set: { active: false, expiresAt: fetchedAt } }
  );
  company.activeJobCount = jobs.length;
  company.lastDiscoveredAt = fetchedAt;
  await company.save();
  return jobs.length;
}

function scoreJob(user, job, company) {
  const preferences = user.jobPreferences || {};
  const haystack = normalize(`${job.title} ${job.description} ${(job.departments || []).join(' ')}`);
  const roles = preferences.targetRoles || [];
  const skills = (user.skills || []).map((skill) => skill.name).filter(Boolean);
  const matchedSkills = skills.filter((skill) => haystack.includes(normalize(skill)));
  const missingSkills = [];
  let score = 25;
  const reasons = [];
  if ((preferences.targetCountries || []).includes(job.country)) { score += 20; reasons.push(`Matches target country ${job.country}`); }
  const role = roles.find((item) => haystack.includes(normalize(item)));
  if (role) { score += 25; reasons.push(`Matches target role ${role}`); }
  if (skills.length && matchedSkills.length) {
    const skillPoints = Math.min(20, Math.round((matchedSkills.length / Math.min(skills.length, 8)) * 20));
    score += skillPoints; reasons.push(`${matchedSkills.length} profile skill${matchedSkills.length === 1 ? '' : 's'} found in the posting`);
  }
  if ((preferences.companyTypes || []).includes(company.companyType)) { score += 10; reasons.push('Matches preferred company type'); }
  if ((preferences.workModes || []).includes(job.workMode)) { score += 10; reasons.push(`Matches ${job.workMode} preference`); }
  if (!roles.length) reasons.push('Add target roles to improve matching');
  return { score: Math.min(100, score), reasons, missingSkills };
}

async function matchUser(user) {
  const preferences = user.jobPreferences || {};
  const query = { active: true };
  if (preferences.targetCountries?.length) query.country = { $in: preferences.targetCountries };
  const jobs = await DiscoveredJob.find(query).sort({ publishedAt: -1 }).limit(1000).lean();
  const companies = new Map((await Company.find({ _id: { $in: jobs.map((job) => job.companyId) } }).lean()).map((company) => [String(company._id), company]));
  const threshold = preferences.minimumMatchScore ?? 50;
  const operations = jobs.map((job) => {
    const company = companies.get(String(job.companyId));
    const match = scoreJob(user, job, company || {});
    if (match.score < threshold) return null;
    return { updateOne: {
      filter: { userId: user.userId, jobId: job._id },
      update: { $set: { companyId: job.companyId, ...match, matchedAt: new Date() }, $setOnInsert: { status: 'new' } },
      upsert: true,
    } };
  }).filter(Boolean);
  if (operations.length) await JobRecommendation.bulkWrite(operations);
  return operations.length;
}

async function runDiscovery() {
  await syncConfiguredCompanies();
  const companies = await Company.find({ enabled: true, source: { $in: ['greenhouse', 'lever'] } });
  const results = [];
  for (const company of companies) {
    try { results.push({ company: company.name, jobs: await ingestCompany(company) }); }
    catch (error) { logger.warn('Company discovery failed', { company: company.name, source: company.source, error: error.message }); results.push({ company: company.name, error: error.message }); }
  }
  const users = await User.find({ 'jobPreferences.targetCountries.0': { $exists: true } });
  let recommendations = 0;
  for (const user of users) recommendations += await matchUser(user);
  logger.info('Job discovery completed', { companies: companies.length, users: users.length, recommendations });
  return { companies: results, usersMatched: users.length, recommendations };
}

module.exports = { runDiscovery, matchUser, syncConfiguredCompanies, scoreJob };
