const axios = require('axios');
const JobDescription = require('../models/JobDescription');
const { retryWithJitter } = require('../utils/retryWithJitter');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);
const AI_RETRY_ATTEMPTS = Number(process.env.AI_RETRY_ATTEMPTS || 3);

exports.createJobDescription = async (req, res, next) => {
  try {
    const { company, role, description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Job description text is required' });
    }

    const jd = new JobDescription({
      userId: req.user.userId,
      company,
      role,
      description,
    });
    await jd.save();
    res.status(201).json(jd);
  } catch (err) {
    next(err);
  }
};

exports.getJobDescriptions = async (req, res, next) => {
  try {
    const jds = await JobDescription.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(jds);
  } catch (err) {
    next(err);
  }
};

exports.getJobDescription = async (req, res, next) => {
  try {
    const jd = await JobDescription.findOne({ _id: req.params.jdId, userId: req.user.userId });
    if (!jd) return res.status(404).json({ error: 'Job description not found' });
    res.json(jd);
  } catch (err) {
    next(err);
  }
};

exports.generateResume = async (req, res, next) => {
  try {
    const { templateId } = req.body;
    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    const jd = await JobDescription.findOne({ _id: req.params.jdId, userId: req.user.userId });
    if (!jd) return res.status(404).json({ error: 'Job description not found' });

    jd.status = 'processing';
    await jd.save();

    const aiResponse = await retryWithJitter(
      () =>
        axios.post(
          `${AI_SERVICE_URL}/generate-resume`,
          {
            user_profile: req.user.toJSON(),
            job_description: jd.description,
            template_id: templateId,
          },
          { timeout: AI_REQUEST_TIMEOUT_MS }
        ),
      { retries: AI_RETRY_ATTEMPTS }
    );

    const { content, score } = aiResponse.data;

    jd.generatedResumes.push({ templateId, content, score });
    jd.status = 'processed';
    await jd.save();

    res.json(jd);
  } catch (err) {
    if (req.params.jdId) {
      await JobDescription.findByIdAndUpdate(req.params.jdId, { status: 'failed' }).catch(() => {});
    }
    if (err.response) {
      const detail = err.response.data?.detail || err.response.data?.error || err.message;
      const status = err.response.status >= 400 && err.response.status < 600 ? err.response.status : 502;
      return res.status(status).json({ error: 'AI service request failed', detail });
    }
    next(err);
  }
};

const findOwnedResume = async (userId, jdId, resumeId) => {
  const jd = await JobDescription.findOne({ _id: jdId, userId });
  if (!jd) return {};
  return { jd, resume: jd.generatedResumes.id(resumeId) };
};

exports.updateGeneratedResume = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return res.status(400).json({ error: 'Valid resume content is required' });
    }

    const { jd, resume } = await findOwnedResume(
      req.user.userId,
      req.params.jdId,
      req.params.resumeId
    );
    if (!jd) return res.status(404).json({ error: 'Job description not found' });
    if (!resume) return res.status(404).json({ error: 'Generated resume not found' });

    if (resume.content) {
      resume.revisions.push({ content: resume.content });
    }
    resume.content = content;
    resume.updatedAt = new Date();
    await jd.save();

    res.json(resume);
  } catch (err) {
    next(err);
  }
};

exports.restoreGeneratedResumeRevision = async (req, res, next) => {
  try {
    const { jd, resume } = await findOwnedResume(
      req.user.userId,
      req.params.jdId,
      req.params.resumeId
    );
    if (!jd) return res.status(404).json({ error: 'Job description not found' });
    if (!resume) return res.status(404).json({ error: 'Generated resume not found' });

    const revision = resume.revisions.id(req.params.revisionId);
    if (!revision) return res.status(404).json({ error: 'Resume revision not found' });

    if (resume.content) {
      resume.revisions.push({ content: resume.content });
    }
    resume.content = revision.content;
    resume.updatedAt = new Date();
    await jd.save();

    res.json(resume);
  } catch (err) {
    next(err);
  }
};
