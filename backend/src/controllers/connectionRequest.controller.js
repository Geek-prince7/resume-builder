const ConnectionRequest = require('../models/ConnectionRequest');
const JobDescription = require('../models/JobDescription');

const FOLLOW_UP_DAYS = Number(process.env.REFERRAL_FOLLOW_UP_DAYS || 7);
const owned = (userId, id) => ConnectionRequest.findOne({ _id: id, userId });

function draftMessages({ contactName = 'there', company = 'your company', role = 'the open role' }) {
  const firstName = contactName.trim().split(/\s+/)[0] || 'there';
  return {
    connectionMessage: `Hi ${firstName}, I am exploring the ${role} opportunity at ${company}. Your experience caught my attention, and I would value connecting with you.`,
    welcomeMessage: `Thanks for connecting, ${firstName}. I appreciate it. I am learning more about the ${role} opportunity at ${company} and would be grateful for any perspective you can share.`,
    referralMessage: `Hi ${firstName}, I am applying for the ${role} role at ${company}. My background appears relevant to the position. If, after reviewing my profile, you feel comfortable referring me, I would be grateful. No pressure at all.`,
    followUpMessage: `Hi ${firstName}, just following up once regarding the ${role} role at ${company}. I know schedules get busy, so no worries if you are unable to help. Thank you for your time.`,
  };
}

exports.list = async (req, res, next) => {
  try {
    const query = { userId: req.user.userId };
    if (req.query.status) query.status = req.query.status;
    const records = await ConnectionRequest.find(query).sort({ followUpAt: 1, createdAt: -1 });
    res.json(records);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.contactName?.trim()) return res.status(400).json({ error: 'Contact name is required' });
    if (req.body.profileUrl && !/^https?:\/\//i.test(req.body.profileUrl)) return res.status(400).json({ error: 'Profile URL must start with http:// or https://' });
    let job;
    if (req.body.jobDescriptionId) {
      job = await JobDescription.findOne({ _id: req.body.jobDescriptionId, userId: req.user.userId });
      if (!job) return res.status(400).json({ error: 'Linked job was not found' });
    }
    const context = { ...req.body, company: req.body.company || job?.company, role: req.body.role || job?.role };
    const record = await ConnectionRequest.create({
      ...context,
      userId: req.user.userId,
      ...draftMessages(context),
    });
    res.status(201).json(record);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const record = await owned(req.user.userId, req.params.id);
    if (!record) return res.status(404).json({ error: 'Connection request not found' });
    const allowed = ['contactName', 'company', 'role', 'profileUrl', 'requestType', 'status', 'connectionMessage', 'welcomeMessage', 'referralMessage', 'followUpMessage', 'sentAt', 'acceptedAt', 'followUpAt', 'lastContactedAt', 'notes', 'jobDescriptionId'];
    if (req.body.profileUrl && !/^https?:\/\//i.test(req.body.profileUrl)) return res.status(400).json({ error: 'Profile URL must start with http:// or https://' });
    if (req.body.jobDescriptionId) {
      const job = await JobDescription.findOne({ _id: req.body.jobDescriptionId, userId: req.user.userId });
      if (!job) return res.status(400).json({ error: 'Linked job was not found' });
    }
    allowed.forEach((key) => { if (key in req.body) record[key] = req.body[key]; });
    if (req.body.status === 'sent') {
      record.sentAt ||= new Date();
      record.lastContactedAt = new Date();
      record.followUpAt ||= new Date(Date.now() + FOLLOW_UP_DAYS * 86400000);
    }
    if (req.body.status === 'accepted') record.acceptedAt ||= new Date();
    await record.save();
    res.json(record);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await ConnectionRequest.deleteOne({ _id: req.params.id, userId: req.user.userId });
    if (!result.deletedCount) return res.status(404).json({ error: 'Connection request not found' });
    res.status(204).end();
  } catch (err) { next(err); }
};

exports.due = async (req, res, next) => {
  try {
    const records = await ConnectionRequest.find({ userId: req.user.userId, status: 'sent', followUpAt: { $lte: new Date() } }).sort({ followUpAt: 1 });
    res.json(records);
  } catch (err) { next(err); }
};
