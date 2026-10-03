const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Service = require('../src/models/Service');

describe('DevHub Dependency Management API', () => {
  let adminToken;
  let svc1Id;
  let svc2Id;

  before(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhub';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { directConnection: true });
    }

    const adminRes = await request(app).post('/api/auth/demo-login').send({ role: 'ADMIN' });
    adminToken = adminRes.body.token;

    const services = await Service.find().limit(2);
    if (services && services.length >= 2) {
      svc1Id = services[0]._id;
      svc2Id = services[1]._id;
    }
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('should fetch formatted React Flow graph structure', async () => {
    const res = await request(app)
      .get('/api/dependencies/graph')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.nodes));
    assert.ok(Array.isArray(res.body.edges));
    if (res.body.nodes.length > 0) {
      assert.ok(res.body.nodes[0].position);
      assert.ok(res.body.nodes[0].data);
    }
  });

  test('should prevent a service from depending on itself', async () => {
    if (!svc1Id) return;
    const res = await request(app)
      .post('/api/dependencies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sourceService: svc1Id,
        targetService: svc1Id,
        dependencyType: 'REST API'
      });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });
});
