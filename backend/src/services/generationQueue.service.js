const { Queue, Worker } = require('bullmq');
const axios = require('axios');
const User = require('../models/User');
const JobDescription = require('../models/JobDescription');
const { reserveQuota, completeQuota, releaseQuota } = require('./quota.service');
const { logger } = require('../logger');

const redisUrl = process.env.REDIS_URL ? new URL(process.env.REDIS_URL) : null;
const connection = redisUrl ? {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null,
} : null;
const queue = connection ? new Queue('resume-generation', { connection }) : null;

async function processGeneration(job) {
  const { userId, jdId, templateId } = job.data;
  const [user, jd] = await Promise.all([User.findOne({ userId }), JobDescription.findOne({ _id: jdId, userId })]);
  if (!user || !jd) throw new Error('Generation resources no longer exist');
  const usageEvent = await reserveQuota(userId, 'resume_generate', jdId);
  try {
    await job.updateProgress(20);
    const response = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/generate-resume`, {
      user_profile: user.toJSON(), job_description: jd.description, template_id: templateId,
    }, { timeout: Number(process.env.AI_REQUEST_TIMEOUT_MS || 90000), headers: { 'X-Request-Id': job.id } });
    await job.updateProgress(80);
    const { content, score, usage, ats_report: atsReport } = response.data;
    await completeQuota(usageEvent, usage);
    jd.generatedResumes.push({ templateId, content, score, atsReport }); jd.status = 'processed'; await jd.save();
    await job.updateProgress(100);
    return { jdId, resumeId: jd.generatedResumes.at(-1)._id };
  } catch (error) {
    await releaseQuota(usageEvent); jd.status = 'failed'; await jd.save(); throw error;
  }
}

if (connection) {
  const worker = new Worker('resume-generation', processGeneration, { connection, concurrency: Number(process.env.AI_JOB_CONCURRENCY || 2) });
  worker.on('failed', (job, error) => logger.error('Background generation failed', { jobId: job?.id, error: error.message }));
}

async function enqueueGeneration(data) {
  if (!queue) { const error = new Error('Background jobs are not configured'); error.status = 503; throw error; }
  return queue.add('generate', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100, removeOnFail: 100 });
}
async function getGenerationJob(id) {
  if (!queue) return null;
  const job = await queue.getJob(id); if (!job) return null;
  return { id: job.id, userId: job.data.userId, state: await job.getState(), progress: job.progress, result: job.returnvalue, error: job.failedReason };
}
module.exports = { enqueueGeneration, getGenerationJob };
