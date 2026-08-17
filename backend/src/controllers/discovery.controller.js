const Company = require('../models/Company');
const JobRecommendation = require('../models/JobRecommendation');
const JobDescription = require('../models/JobDescription');
const User = require('../models/User');
const { matchUser } = require('../services/discovery.service');
const { enqueueDiscovery } = require('../services/discoveryQueue.service');

exports.listRecommendations = async (req, res, next) => {
  try {
    const query = { userId: req.user.userId };
    if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
    const recommendations = await JobRecommendation.find(query)
      .populate('jobId').populate('companyId').sort({ score: -1, matchedAt: -1 }).limit(200);
    res.json(recommendations.filter((item) => item.jobId?.active));
  } catch (error) { next(error); }
};

exports.summary = async (req, res, next) => {
  try {
    const rows = await JobRecommendation.aggregate([
      { $match: { userId: req.user.userId } },
      { $group: { _id: '$status', count: { $sum: 1 }, averageScore: { $avg: '$score' } } },
    ]);
    const byStatus = Object.fromEntries(rows.map((row) => [row._id, row.count]));
    res.json({ total: rows.reduce((sum, row) => sum + row.count, 0), byStatus, averageScore: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.averageScore * row.count, 0) / rows.reduce((sum, row) => sum + row.count, 0)) : 0 });
  } catch (error) { next(error); }
};

exports.listCompanies = async (req, res, next) => {
  try {
    const preferences = req.user.jobPreferences || {};
    const query = { enabled: true };
    if (preferences.targetCountries?.length) query.country = { $in: preferences.targetCountries };
    if (preferences.companyTypes?.length) query.companyType = { $in: preferences.companyTypes };
    res.json(await Company.find(query).sort({ activeJobCount: -1, name: 1 }).limit(200));
  } catch (error) { next(error); }
};

exports.refreshMatches = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    const matched = await matchUser(user);
    res.json({ matched });
  } catch (error) { next(error); }
};

exports.runDiscovery = async (_req, res, next) => {
  try {
    const job = await enqueueDiscovery();
    res.status(202).json({ queued: true, jobId: job?.id || null });
  } catch (error) { next(error); }
};

exports.updateRecommendation = async (req, res, next) => {
  try {
    const allowed = ['saved', 'dismissed', 'applied', 'new'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid recommendation status' });
    const recommendation = await JobRecommendation.findOne({ _id: req.params.id, userId: req.user.userId }).populate('jobId');
    if (!recommendation) return res.status(404).json({ error: 'Recommendation not found' });
    recommendation.status = req.body.status;
    await recommendation.save();
    let trackedJob;
    if (req.body.status === 'saved' || req.body.status === 'applied') {
      const job = recommendation.jobId;
      trackedJob = await JobDescription.findOneAndUpdate(
        { userId: req.user.userId, jobUrl: job.jobUrl },
        { $setOnInsert: { company: job.companyName, role: job.title, jobUrl: job.jobUrl, location: job.location, source: job.source, description: job.description, applicationStatus: req.body.status === 'applied' ? 'applied' : 'saved', appliedAt: req.body.status === 'applied' ? new Date() : undefined } },
        { upsert: true, new: true, runValidators: true }
      );
    }
    res.json({ recommendation, trackedJob });
  } catch (error) { next(error); }
};
