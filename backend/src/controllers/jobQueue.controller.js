const JobDescription = require('../models/JobDescription');
const { enqueueGeneration, getGenerationJob } = require('../services/generationQueue.service');

exports.enqueue = async (req, res, next) => {
  try {
    const jd = await JobDescription.findOne({ _id: req.params.jdId, userId: req.user.userId });
    if (!jd) return res.status(404).json({ error: 'Job description not found' });
    jd.status = 'processing'; await jd.save();
    const job = await enqueueGeneration({ userId: req.user.userId, jdId: jd.id, templateId: req.body.templateId });
    res.status(202).json({ jobId: job.id, statusUrl: `/api/job-descriptions/jobs/${job.id}` });
  } catch (err) { next(err); }
};
exports.status = async (req, res, next) => {
  try { const job = await getGenerationJob(req.params.jobId); if (!job || job.userId !== req.user.userId) return res.status(404).json({ error: 'Job not found' }); const { userId, ...publicJob } = job; res.json(publicJob); }
  catch (err) { next(err); }
};
