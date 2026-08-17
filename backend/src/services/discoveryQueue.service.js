const { Queue, Worker } = require('bullmq');
const { runDiscovery } = require('./discovery.service');
const { logger } = require('../logger');

const redisUrl = process.env.REDIS_URL ? new URL(process.env.REDIS_URL) : null;
const connection = redisUrl ? { host: redisUrl.hostname, port: Number(redisUrl.port || 6379), password: redisUrl.password || undefined, maxRetriesPerRequest: null } : null;
const queue = connection ? new Queue('job-discovery', { connection }) : null;

if (connection) {
  const worker = new Worker('job-discovery', () => runDiscovery(), { connection, concurrency: 1 });
  worker.on('failed', (job, error) => logger.error('Scheduled job discovery failed', { jobId: job?.id, error: error.message }));
  queue.add('scheduled-discovery', {}, {
    jobId: 'scheduled-discovery',
    repeat: { every: Number(process.env.DISCOVERY_INTERVAL_MS || 21600000) },
    removeOnComplete: 20,
    removeOnFail: 50,
  }).catch((error) => logger.error('Could not schedule job discovery', { error: error.message }));
}

async function enqueueDiscovery() {
  if (!queue) return runDiscovery();
  const fiveMinuteBucket = Math.floor(Date.now() / 300000);
  return queue.add('manual-discovery', {}, { jobId: `manual-discovery-${fiveMinuteBucket}`, removeOnComplete: 20, removeOnFail: 50 });
}

module.exports = { enqueueDiscovery };
