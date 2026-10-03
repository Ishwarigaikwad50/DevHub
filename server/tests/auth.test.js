const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

describe('DevHub Authentication & Authorization API', () => {
  before(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhub';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { directConnection: true });
    }
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('should authenticate demo admin successfully and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@devhub.io',
        password: 'Password123!'
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'ADMIN');
  });

  test('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@devhub.io',
        password: 'WrongPassword999'
      });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('should reject unauthorized access to protected routes without token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('should allow login via demo-login endpoint for quick role switching', async () => {
    const res = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'DEVELOPER' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'DEVELOPER');
  });
});
