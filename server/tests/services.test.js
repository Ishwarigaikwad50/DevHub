const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Team = require('../src/models/Team');

describe('DevHub Service Catalog API', () => {
  let adminToken;
  let viewerToken;
  let devTeamId;

  before(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhub';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { directConnection: true });
    }

    const adminRes = await request(app).post('/api/auth/demo-login').send({ role: 'ADMIN' });
    adminToken = adminRes.body.token;

    const viewerRes = await request(app).post('/api/auth/demo-login').send({ role: 'VIEWER' });
    viewerToken = viewerRes.body.token;

    const team = await Team.findOne();
    devTeamId = team ? team._id : null;
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('should list all registered services with stats and filtering', async () => {
    const res = await request(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.services));
    assert.ok(res.body.total > 0);
  });

  test('should create a new service with auto-provisioned environments', async () => {
    const testKey = `test-service-${Date.now()}`;
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Microservice',
        key: testKey,
        description: 'Automated test created microservice',
        serviceType: 'Backend Service',
        ownerTeam: devTeamId,
        technologies: ['Node.js', 'PostgreSQL'],
        language: 'TypeScript'
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.service.key, testKey);

    // Verify environments were auto-created
    const envRes = await request(app)
      .get(`/api/services/${res.body.service._id}/environments`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(envRes.statusCode, 200);
    assert.strictEqual(envRes.body.environments.length, 3); // Dev, Staging, Production
  });

  test('should reject duplicate service keys', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Duplicate Payment Service',
        key: 'payment-service',
        description: 'Should fail with 409 conflict',
        ownerTeam: devTeamId
      });

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.body.success, false);
  });

  test('should prevent VIEWER role from creating new services', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        name: 'Unauthorized Service',
        key: 'unauthorized-service',
        description: 'Viewer cannot create service',
        ownerTeam: devTeamId
      });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
  });
});
