const axios = require('axios');
const User = require('../models/User');
const { retryWithJitter } = require('../utils/retryWithJitter');
const { reserveQuota, completeQuota, releaseQuota } = require('../services/quota.service');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);
const AI_RETRY_ATTEMPTS = Number(process.env.AI_RETRY_ATTEMPTS || 3);

exports.getUser = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const blocked = ['password', 'authProvider', 'googleId', 'userId', 'email'];
    const update = { ...req.body };
    for (const key of blocked) delete update[key];

    const user = await User.findOneAndUpdate(
      { userId: req.user.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.parseResume = async (req, res, next) => {
  let usageEvent;
  let quotaCompleted = false;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    usageEvent = await reserveQuota(req.user.userId, 'resume_parse');

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);

    const aiResponse = await retryWithJitter(
      () =>
        axios.post(`${AI_SERVICE_URL}/parse-resume`, formData, {
          timeout: AI_REQUEST_TIMEOUT_MS,
          headers: { 'Content-Type': 'multipart/form-data', 'X-Request-Id': req.id },
        }),
      { retries: AI_RETRY_ATTEMPTS }
    );

    const parsedData = aiResponse.data.data;
    await completeQuota(usageEvent, aiResponse.data.usage);
    quotaCompleted = true;

    const user = await User.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: parsedData },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Resume parsed and profile updated', user });
  } catch (err) {
    if (usageEvent && !quotaCompleted) await releaseQuota(usageEvent).catch(() => {});
    next(err);
  }
};
