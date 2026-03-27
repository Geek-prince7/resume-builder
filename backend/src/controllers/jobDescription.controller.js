const axios = require('axios');
const JobDescription = require('../models/JobDescription');
const User = require('../models/User');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.createJobDescription = async (req, res, next) => {
  try {
    const { company, role, description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Job description text is required' });
    }

    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const jd = new JobDescription({
      userId: req.params.userId,
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
    const jds = await JobDescription.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(jds);
  } catch (err) {
    next(err);
  }
};

exports.getJobDescription = async (req, res, next) => {
  try {
    const jd = await JobDescription.findById(req.params.jdId);
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

    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const jd = await JobDescription.findById(req.params.jdId);
    if (!jd) return res.status(404).json({ error: 'Job description not found' });

    jd.status = 'processing';
    await jd.save();

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/generate-resume`, {
      user_profile: user.toObject(),
      job_description: jd.description,
      template_id: templateId,
    });

    const { content, html_content, score } = aiResponse.data;

    jd.generatedResumes.push({
      templateId,
      content,
      htmlContent: html_content,
      score,
    });
    jd.status = 'processed';
    await jd.save();

    res.json(jd);
  } catch (err) {
    const jdId = req.params.jdId;
    if (jdId) {
      await JobDescription.findByIdAndUpdate(jdId, { status: 'failed' }).catch(() => {});
    }
    next(err);
  }
};
