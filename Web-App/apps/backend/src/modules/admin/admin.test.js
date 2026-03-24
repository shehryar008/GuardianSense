const request = require('supertest');
const app = require('../../../server');

describe('Admin API', () => {
  // ── POST /api/admin/login ─────────────────────────────────────────────────
  describe('POST /api/admin/login', () => {
    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ password: 'test123456' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@test.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: 'not-an-email', password: 'test123456' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@test.com', password: '123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for wrong credentials (requires DB)', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: 'nonexistent@admin.com', password: 'wrongpassword123' });
      // 401 if DB connected, 500 if not
      expect([401, 500]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Protected routes without token ────────────────────────────────────────
  describe('Protected routes without token', () => {
    it('GET /api/admin/dashboard/stats should return 401', async () => {
      const res = await request(app).get('/api/admin/dashboard/stats');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/hospitals should return 401', async () => {
      const res = await request(app).get('/api/admin/hospitals');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/police-stations should return 401', async () => {
      const res = await request(app).get('/api/admin/police-stations');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/incidents should return 401', async () => {
      const res = await request(app).get('/api/admin/incidents');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/users should return 401', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/reports should return 401', async () => {
      const res = await request(app).get('/api/admin/reports');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/activity-log should return 401', async () => {
      const res = await request(app).get('/api/admin/activity-log');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Protected routes with invalid token ───────────────────────────────────
  describe('Protected routes with invalid token', () => {
    it('should return 401 for invalid Bearer token', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Param validation ──────────────────────────────────────────────────────
  describe('ID parameter validation', () => {
    const token = 'Bearer fake-token'; // Will get 401, but body validation runs first for some

    it('GET /api/admin/hospitals/abc should return 401 (no valid token)', async () => {
      const res = await request(app).get('/api/admin/hospitals/abc');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/admin/police-stations/abc should return 401 (no valid token)', async () => {
      const res = await request(app).get('/api/admin/police-stations/abc');
      expect(res.statusCode).toBe(401);
    });
  });
});
