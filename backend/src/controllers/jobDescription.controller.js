const axios = require('axios');
const JobDescription = require('../models/JobDescription');
const { retryWithJitter } = require('../utils/retryWithJitter');
const { reserveQuota, completeQuota, releaseQuota } = require('../services/quota.service');
const ProfileVariant = require('../models/ProfileVariant');
const { renderResumeHtml } = require('../services/resumeHtml.service');
const { createPdf } = require('../services/pdf.service');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);
const AI_RETRY_ATTEMPTS = Number(process.env.AI_RETRY_ATTEMPTS || 3);

exports.createJobDescription = async (req, res, next) => {
  try {
    const { company, role, description, profileVariantId } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Job description text is required' });
    }

    const jd = new JobDescription({
      userId: req.user.userId,
      company,
      role,
      description,
      profileVariantId,
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
  let usageEvent;
  let quotaCompleted = false;
  try {
    const { templateId, profileVariantId } = req.body;
    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    const jd = await JobDescription.findOne({ _id: req.params.jdId, userId: req.user.userId });
    if (!jd) return res.status(404).json({ error: 'Job description not found' });

    jd.status = 'processing';
    await jd.save();
    usageEvent = await reserveQuota(req.user.userId, 'resume_generate', jd.id);

    const userProfile = await buildProfile(req.user, profileVariantId || jd.profileVariantId);
    const aiResponse = await retryWithJitter(
      () =>
        axios.post(
          `${AI_SERVICE_URL}/generate-resume`,
          {
            user_profile: userProfile,
            job_description: jd.description,
            template_id: templateId,
          },
          { timeout: AI_REQUEST_TIMEOUT_MS }
        ),
      { retries: AI_RETRY_ATTEMPTS }
    );

    const { content, score, usage, ats_report: atsReport } = aiResponse.data;
    await completeQuota(usageEvent, usage);
    quotaCompleted = true;

    jd.generatedResumes.push({ templateId, content, score, atsReport });
    jd.status = 'processed';
    await jd.save();

    res.json(jd);
  } catch (err) {
    if (usageEvent && !quotaCompleted) await releaseQuota(usageEvent).catch(() => {});
    if (req.params.jdId) {
      await JobDescription.findByIdAndUpdate(req.params.jdId, { status: 'failed' }).catch(() => {});
    }
    if (err.response) {
      const detail = err.response.data?.detail || err.response.data?.error || err.message;
      const status = err.response.status >= 400 && err.response.status < 600 ? err.response.status : 502;
      return res.status(status).json({ error: 'AI service request failed', detail });
    }
    if (err.code === 'QUOTA_EXCEEDED') {
      return res.status(402).json({ error: err.message, code: err.code, details: err.details });
    }
    next(err);
  }
};

async function buildProfile(user, variantId) {
  const profile = user.toJSON();
  if (!variantId) return profile;
  const variant = await ProfileVariant.findOne({ _id: variantId, userId: user.userId });
  if (!variant) return profile;
  if (variant.summary) profile.summary = variant.summary;
  if (variant.targetRole) profile.targetRole = variant.targetRole;
  if (variant.skillNames?.length) {
    const selected = new Set(variant.skillNames.map((name) => name.toLowerCase()));
    profile.skills = (profile.skills || []).filter((skill) => selected.has(skill.name.toLowerCase()));
  }
  if (variant.experienceIds?.length) {
    const selected = new Set(variant.experienceIds);
    profile.experiences = (profile.experiences || []).filter((item) => selected.has(String(item._id)));
  }
  if (variant.projectIds?.length) {
    const selected = new Set(variant.projectIds);
    profile.projects = (profile.projects || []).filter((item) => selected.has(String(item._id)));
  }
  return profile;
}

exports.generateCoverLetter = async (req, res, next) => {
  let usageEvent;
  let quotaCompleted = false;
  try {
    const jd = await JobDescription.findOne({ _id: req.params.jdId, userId: req.user.userId });
    if (!jd) return res.status(404).json({ error: 'Job description not found' });
    usageEvent = await reserveQuota(req.user.userId, 'cover_letter', jd.id);
    const userProfile = await buildProfile(req.user, req.body.profileVariantId || jd.profileVariantId);
    const aiResponse = await retryWithJitter(
      () => axios.post(`${AI_SERVICE_URL}/generate-cover-letter`, {
        user_profile: userProfile,
        job_description: jd.description,
      }, { timeout: AI_REQUEST_TIMEOUT_MS }),
      { retries: AI_RETRY_ATTEMPTS }
    );
    await completeQuota(usageEvent, aiResponse.data.usage);
    quotaCompleted = true;
    jd.coverLetters.push({ content: aiResponse.data.content, profileVariantId: req.body.profileVariantId });
    await jd.save();
    res.json(jd.coverLetters[jd.coverLetters.length - 1]);
  } catch (err) {
    if (usageEvent && !quotaCompleted) await releaseQuota(usageEvent).catch(() => {});
    if (err.code === 'QUOTA_EXCEEDED') {
      return res.status(402).json({ error: err.message, code: err.code, details: err.details });
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

exports.downloadGeneratedResumePdf = async (req, res, next) => {
  try {
    const { jd, resume } = await findOwnedResume(req.user.userId, req.params.jdId, req.params.resumeId);
    if (!jd) return res.status(404).json({ error: 'Job description not found' });
    if (!resume) return res.status(404).json({ error: 'Generated resume not found' });
    const pageSize = req.query.pageSize === 'A4' ? 'A4' : 'Letter';
    const density = req.query.density === 'compact' ? 'compact' : 'standard';
    const pdf = await createPdf(renderResumeHtml(resume.content, resume.templateId, { pageSize, density }), pageSize);
    const safe = (value, fallback) => String(value || fallback).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const filename = `${safe(resume.content?.name, 'username')}_${safe(jd.role, 'position')}_${safe(jd.company, 'company')}.pdf`;
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"`, 'Content-Length': pdf.length });
    res.send(pdf);
  } catch (err) { next(err); }
};
