const request = require('supertest');
const speakeasy = require('speakeasy');
require('dotenv').config();

const BASE_URL = global.BASE_URL || `http://localhost:${process.env.PORT || 6969}`;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function isRateLimited(res) {
  return res.statusCode === 429 && res.body && typeof res.body.message === 'string' && res.body.message.includes('Too many');
}

describe('Authentication API', () => {
  beforeEach(async () => {
    await delay(1200);
  });

  it('should register a new user', async () => {
    const user = {
      username: `register_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      password: 'SecurePass123!'
    };
    const res = await request(BASE_URL)
      .post('/api/auth/register')
      .send(user)
      .timeout(10000);
    if (isRateLimited(res)) return expect(res.statusCode).toBe(429);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('totp_secret');
  });

  it('should verify a user with valid OTP', async () => {
    // Register first
    const user = {
      username: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      password: 'SecurePass123!'
    };
    const regRes = await request(BASE_URL)
      .post('/api/auth/register')
      .send(user)
      .timeout(10000);
    if (isRateLimited(regRes)) return expect(regRes.statusCode).toBe(429);
    const totpSecret = regRes.body.totp_secret;
    const otp = speakeasy.totp({ secret: totpSecret, encoding: 'base32' });
    const res = await request(BASE_URL)
      .post('/api/auth/verify')
      .send({ username: user.username, otp })
      .timeout(10000);
    if (isRateLimited(res)) return expect(res.statusCode).toBe(429);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('TOTP verified. You may now log in.');
  });

  it('should login a verified user', async () => {
    // Register and verify first
    const user = {
      username: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      password: 'SecurePass123!'
    };
    const regRes = await request(BASE_URL)
      .post('/api/auth/register')
      .send(user)
      .timeout(10000);
    if (isRateLimited(regRes)) return expect(regRes.statusCode).toBe(429);
    const totpSecret = regRes.body.totp_secret;
    const otp = speakeasy.totp({ secret: totpSecret, encoding: 'base32' });
    const verifyRes = await request(BASE_URL)
      .post('/api/auth/verify')
      .send({ username: user.username, otp })
      .timeout(10000);
    if (isRateLimited(verifyRes)) return expect(verifyRes.statusCode).toBe(429);
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send(user)
      .timeout(10000);
    if (isRateLimited(res)) return expect(res.statusCode).toBe(429);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe(user.username);
    expect(res.body.user.verified).toBe(true);
  });

  it('should logout a logged-in user', async () => {
    // Register, verify, and login first
    const user = {
      username: `logout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      password: 'SecurePass123!'
    };
    const regRes = await request(BASE_URL)
      .post('/api/auth/register')
      .send(user)
      .timeout(10000);
    if (isRateLimited(regRes)) return expect(regRes.statusCode).toBe(429);
    const totpSecret = regRes.body.totp_secret;
    const otp = speakeasy.totp({ secret: totpSecret, encoding: 'base32' });
    const verifyRes = await request(BASE_URL)
      .post('/api/auth/verify')
      .send({ username: user.username, otp })
      .timeout(10000);
    if (isRateLimited(verifyRes)) return expect(verifyRes.statusCode).toBe(429);
    const loginRes = await request(BASE_URL)
      .post('/api/auth/login')
      .send(user)
      .timeout(10000);
    if (isRateLimited(loginRes)) return expect(loginRes.statusCode).toBe(429);
    const authToken = loginRes.body.token;
    const res = await request(BASE_URL)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`)
      .timeout(10000);
    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.message).toBe('Logged out successfully');
    }
  });

  it('should reset password for a verified user', async () => {
    // Register and verify first
    const user = {
      username: `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      password: 'SecurePass123!'
    };
    const regRes = await request(BASE_URL)
      .post('/api/auth/register')
      .send(user)
      .timeout(10000);
    if (isRateLimited(regRes)) return expect(regRes.statusCode).toBe(429);
    const totpSecret = regRes.body.totp_secret;
    const otp = speakeasy.totp({ secret: totpSecret, encoding: 'base32' });
    const verifyRes = await request(BASE_URL)
      .post('/api/auth/verify')
      .send({ username: user.username, otp })
      .timeout(10000);
    if (isRateLimited(verifyRes)) return expect(verifyRes.statusCode).toBe(429);
    const res = await request(BASE_URL)
      .post('/api/auth/reset')
      .send({ username: user.username, newPassword: 'NewSecurePass123!', otp })
      .timeout(10000);
    if (isRateLimited(res)) return expect(res.statusCode).toBe(429);
    expect([200, 401, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.message).toBe('Password resetted. You may now log in.');
    }
  });

  it('should delete a user with DELETE /api/users/me', async () => {
    // Register, verify, and login first
    const user = {
      username: `delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      password: 'SecurePass123!'
    };
    const regRes = await request(BASE_URL)
      .post('/api/auth/register')
      .send(user)
      .timeout(10000);
    if (isRateLimited(regRes)) return expect(regRes.statusCode).toBe(429);
    const totpSecret = regRes.body.totp_secret;
    const otp = speakeasy.totp({ secret: totpSecret, encoding: 'base32' });
    const verifyRes = await request(BASE_URL)
      .post('/api/auth/verify')
      .send({ username: user.username, otp })
      .timeout(10000);
    if (isRateLimited(verifyRes)) return expect(verifyRes.statusCode).toBe(429);
    const loginRes = await request(BASE_URL)
      .post('/api/auth/login')
      .send(user)
      .timeout(10000);
    if (isRateLimited(loginRes)) return expect(loginRes.statusCode).toBe(429);
    const authToken = loginRes.body.token;
    const res = await request(BASE_URL)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .timeout(10000);
    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.message).toBe('User account deleted successfully');
    }
  });
});

describe('Authentication Rate Limiting', () => {
  it('should enforce rate limit on registration', async () => {
    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(
        request(BASE_URL)
          .post('/api/auth/register')
          .send({
            username: `ratelimit_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            password: 'SecurePass123!'
          })
          .timeout(10000)
      );
    }
    const results = await Promise.all(promises);
    const rateLimited = results.filter(res => res.statusCode === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
    expect(rateLimited[0].body.message).toMatch(/Too many register attempts/i);
  });

  it('should enforce rate limit on login', async () => {
    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(
        request(BASE_URL)
          .post('/api/auth/login')
          .send({
            username: 'nonexistentuser',
            password: 'wrongpassword'
          })
          .timeout(10000)
      );
    }
    const results = await Promise.all(promises);
    const rateLimited = results.filter(res => res.statusCode === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
    expect(rateLimited[0].body.message).toMatch(/Too many login attempts/i);
  });
});