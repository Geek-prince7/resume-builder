const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/security');
const crypto = require('crypto');
const AuthSession = require('../models/AuthSession');
const AccountToken = require('../models/AccountToken');
const JobDescription = require('../models/JobDescription');
const ProfileVariant = require('../models/ProfileVariant');
const UsageEvent = require('../models/UsageEvent');
const ConnectionRequest = require('../models/ConnectionRequest');
const { sendAccountEmail } = require('../services/email.service');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const randomToken = () => crypto.randomBytes(48).toString('base64url');
const cookieValue = (req, name) => (req.headers.cookie || '').split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);

async function issueSession(req, res, user) {
  const refreshToken = randomToken();
  await AuthSession.create({ userId: user.userId, tokenHash: hash(refreshToken), userAgent: req.headers['user-agent'], ip: req.ip, expiresAt: new Date(Date.now() + 30 * 86400000) });
  res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.APP_ENV === 'prod', sameSite: 'lax', path: '/api/auth', maxAge: 30 * 86400000 });
  return generateToken(user.userId);
}

async function sendPurposeToken(user, purpose) {
  await AccountToken.deleteMany({ userId: user.userId, purpose });
  const token = randomToken();
  await AccountToken.create({ userId: user.userId, tokenHash: hash(token), purpose, expiresAt: new Date(Date.now() + (purpose === 'reset_password' ? 3600000 : 86400000)) });
  const path = purpose === 'reset_password' ? 'reset-password' : 'verify-email';
  await sendAccountEmail({ to: user.email, subject: purpose === 'reset_password' ? 'Reset your ResumeAI password' : 'Verify your ResumeAI email', text: `${frontendUrl}/${path}?token=${token}` });
}

router.post('/signup', authRateLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password, authProvider: 'local' });
    await user.save();
    await sendPurposeToken(user, 'verify_email');
    const token = await issueSession(req, res, user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({ error: 'This account uses Google sign-in' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = await issueSession(req, res, user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post('/google', authRateLimiter, async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      user.emailVerified = true;
      user.emailVerifiedAt ||= new Date();
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture) user.profilePicture = picture;
      }
      await user.save();
    } else {
      user = new User({
        googleId,
        email,
        name,
        profilePicture: picture,
        authProvider: 'google',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });
      await user.save();
    }

    const token = await issueSession(req, res, user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

router.post('/refresh', async (req, res) => {
  const token = cookieValue(req, 'refresh_token');
  if (!token) return res.status(401).json({ error: 'Refresh session required' });
  const session = await AuthSession.findOne({ tokenHash: hash(token), revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!session) return res.status(401).json({ error: 'Refresh session is invalid' });
  session.revokedAt = new Date(); await session.save();
  const user = await User.findOne({ userId: session.userId });
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json({ token: await issueSession(req, res, user), user });
});

router.post('/logout', async (req, res) => {
  const token = cookieValue(req, 'refresh_token');
  if (token) await AuthSession.findOneAndUpdate({ tokenHash: hash(token) }, { revokedAt: new Date() });
  res.clearCookie('refresh_token', { path: '/api/auth' }); res.status(204).end();
});

router.post('/logout-all', authenticate, async (req, res) => {
  await AuthSession.updateMany({ userId: req.user.userId, revokedAt: null }, { revokedAt: new Date() });
  res.clearCookie('refresh_token', { path: '/api/auth' }); res.status(204).end();
});

router.post('/verify-email', authRateLimiter, async (req, res) => {
  const record = await AccountToken.findOne({ tokenHash: hash(req.body.token || ''), purpose: 'verify_email', usedAt: null, expiresAt: { $gt: new Date() } });
  if (!record) return res.status(400).json({ error: 'Verification token is invalid or expired' });
  record.usedAt = new Date(); await record.save();
  await User.findOneAndUpdate({ userId: record.userId }, { emailVerified: true, emailVerifiedAt: new Date() });
  res.json({ verified: true });
});

router.post('/forgot-password', authRateLimiter, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) await sendPurposeToken(user, 'reset_password');
  res.json({ message: 'If the account exists, a reset link has been sent' });
});

router.post('/reset-password', authRateLimiter, async (req, res) => {
  if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const record = await AccountToken.findOne({ tokenHash: hash(req.body.token || ''), purpose: 'reset_password', usedAt: null, expiresAt: { $gt: new Date() } });
  if (!record) return res.status(400).json({ error: 'Reset token is invalid or expired' });
  const user = await User.findOne({ userId: record.userId }); user.password = req.body.password; await user.save();
  record.usedAt = new Date(); await record.save(); await AuthSession.updateMany({ userId: user.userId, revokedAt: null }, { revokedAt: new Date() });
  res.json({ reset: true });
});

router.get('/export', authenticate, async (req, res) => {
  const [jobDescriptions, profileVariants, usageEvents, connectionRequests] = await Promise.all([JobDescription.find({ userId: req.user.userId }), ProfileVariant.find({ userId: req.user.userId }), UsageEvent.find({ userId: req.user.userId }), ConnectionRequest.find({ userId: req.user.userId })]);
  res.set('Content-Disposition', 'attachment; filename="resumeai-data.json"'); res.json({ user: req.user, jobDescriptions, profileVariants, usageEvents, connectionRequests, exportedAt: new Date() });
});

router.delete('/account', authenticate, async (req, res) => {
  await Promise.all([JobDescription.deleteMany({ userId: req.user.userId }), ProfileVariant.deleteMany({ userId: req.user.userId }), UsageEvent.deleteMany({ userId: req.user.userId }), ConnectionRequest.deleteMany({ userId: req.user.userId }), AuthSession.deleteMany({ userId: req.user.userId }), AccountToken.deleteMany({ userId: req.user.userId })]);
  await User.deleteOne({ userId: req.user.userId }); res.clearCookie('refresh_token', { path: '/api/auth' }); res.status(204).end();
});

module.exports = router;
