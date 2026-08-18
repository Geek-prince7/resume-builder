const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;
let app;
test.before(async () => { process.env.APP_ENV = 'dev'; mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri()); app = require('../src/app'); });
test.after(async () => { await mongoose.disconnect(); await mongo.stop(); });

test('health and pricing endpoints are available', async () => {
  assert.equal((await request(app).get('/api/health')).status, 200);
  const pricing = await request(app).get('/api/billing/plans');
  assert.equal(pricing.status, 200); assert.equal(pricing.body.length, 4);
  const templates = await request(app).get('/api/templates');
  assert.equal(templates.status, 200); assert.equal(templates.body.length, 15);
  assert.ok(templates.body.every((template) => template.category));
});

test('signup, protected profile, and quota summary work', async () => {
  const signup = await request(app).post('/api/auth/signup').send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
  assert.equal(signup.status, 201); const token = signup.body.token;
  const profile = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${token}`);
  assert.equal(profile.status, 200); assert.equal(profile.body.email, 'test@example.com');
  const usage = await request(app).get('/api/billing/usage').set('Authorization', `Bearer ${token}`);
  assert.equal(usage.status, 200); assert.equal(usage.body.plan.id, 'free'); assert.equal(usage.body.remaining.aiActions, 3);
});

test('job tracker and referral CRM keep records scoped to the signed-in user', async () => {
  const signup = await request(app).post('/api/auth/signup').send({ name: 'Tracker User', email: 'tracker@example.com', password: 'password123' });
  const auth = { Authorization: `Bearer ${signup.body.token}` };
  const created = await request(app).post('/api/job-descriptions').set(auth).send({
    company: 'Example Corp', role: 'Backend Engineer', jobUrl: 'https://example.com/jobs/42',
    description: 'Build reliable APIs', applicationStatus: 'applied',
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.applicationStatus, 'applied');
  assert.ok(created.body.appliedAt);

  const summary = await request(app).get('/api/job-descriptions/tracker/summary').set(auth);
  assert.equal(summary.status, 200);
  assert.equal(summary.body.applied, 1);

  const contact = await request(app).post('/api/connections').set(auth).send({
    contactName: 'Alex Morgan', profileUrl: 'https://example.com/alex', jobDescriptionId: created.body._id,
  });
  assert.equal(contact.status, 201);
  assert.match(contact.body.referralMessage, /Backend Engineer/);

  const sent = await request(app).put(`/api/connections/${contact.body._id}`).set(auth).send({ status: 'sent' });
  assert.equal(sent.status, 200);
  assert.ok(sent.body.followUpAt);
});

test('target preferences produce user-scoped job recommendations that can be saved', async () => {
  const Company = require('../src/models/Company');
  const DiscoveredJob = require('../src/models/DiscoveredJob');
  const User = require('../src/models/User');
  const { matchUser } = require('../src/services/discovery.service');
  const signup = await request(app).post('/api/auth/signup').send({ name: 'Discovery User', email: 'discovery@example.com', password: 'password123' });
  const auth = { Authorization: `Bearer ${signup.body.token}` };
  const profile = await request(app).put('/api/users/profile').set(auth).send({
    jobPreferences: { targetCountries: ['US'], targetRoles: ['Backend Engineer'], companyTypes: ['startup_growth'], workModes: ['remote'], minimumMatchScore: 50 },
    skills: [{ name: 'Node.js', level: 'advanced' }, { name: 'MongoDB', level: 'advanced' }],
  });
  assert.equal(profile.status, 200);
  assert.deepEqual(profile.body.jobPreferences.targetCountries, ['US']);
  const company = await Company.create({ name: 'Northstar', slug: 'northstar', source: 'lever', country: 'US', companyType: 'startup_growth' });
  await DiscoveredJob.create({ externalId: 'job-1', source: 'lever', companyId: company._id, companyName: company.name, title: 'Backend Engineer', description: 'Build remote Node.js APIs with MongoDB', country: 'US', workMode: 'remote', jobUrl: 'https://example.com/jobs/1' });
  const user = await User.findOne({ userId: signup.body.user.userId });
  assert.equal(await matchUser(user), 1);
  const recommendations = await request(app).get('/api/discovery/recommendations').set(auth);
  assert.equal(recommendations.status, 200);
  assert.equal(recommendations.body.length, 1);
  assert.ok(recommendations.body[0].score >= 90);
  const saved = await request(app).put(`/api/discovery/recommendations/${recommendations.body[0]._id}`).set(auth).send({ status: 'saved' });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.trackedJob.applicationStatus, 'saved');
});
