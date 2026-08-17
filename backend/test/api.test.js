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
});

test('signup, protected profile, and quota summary work', async () => {
  const signup = await request(app).post('/api/auth/signup').send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
  assert.equal(signup.status, 201); const token = signup.body.token;
  const profile = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${token}`);
  assert.equal(profile.status, 200); assert.equal(profile.body.email, 'test@example.com');
  const usage = await request(app).get('/api/billing/usage').set('Authorization', `Bearer ${token}`);
  assert.equal(usage.status, 200); assert.equal(usage.body.plan.id, 'free'); assert.equal(usage.body.remaining.aiActions, 3);
});
