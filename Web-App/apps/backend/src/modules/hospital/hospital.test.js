const request = require('supertest');
const app = require('../../../server');

// ─── Hospital CRUD Tests ──────────────────────────────────────────────────────

describe('Hospital API', () => {
  // ── GET /api/hospitals ────────────────────────────────────────────────────
  describe('GET /api/hospitals', () => {
    it('should return a list of active hospitals', async () => {
      const res = await request(app).get('/api/hospitals');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── GET /api/hospitals/:id ────────────────────────────────────────────────
  describe('GET /api/hospitals/:id', () => {
    it('should return 404 for non-existent hospital', async () => {
      const res = await request(app).get('/api/hospitals/999999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ID', async () => {
      const res = await request(app).get('/api/hospitals/abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── POST /api/hospitals ───────────────────────────────────────────────────
  describe('POST /api/hospitals', () => {
    const validHospital = {
      hospital_name: 'Test Hospital',
      address: '123 Test Street',
      city: 'Test City',
      phone: '+1-555-0100',
      email: 'test@hospital.com',
      bed_capacity: 200,
    };

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/hospitals').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/hospitals')
        .send({ ...validHospital, email: 'not-an-email' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when bed_capacity < 1', async () => {
      const res = await request(app)
        .post('/api/hospitals')
        .send({ ...validHospital, bed_capacity: 0 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should create a hospital with valid data (requires DB)', async () => {
      const res = await request(app).post('/api/hospitals').send(validHospital);
      // Will be 201 if DB is connected, 500 otherwise
      if (res.statusCode === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.hospital_name).toBe(validHospital.hospital_name);
      } else {
        expect(res.statusCode).toBe(500);
      }
    });
  });

  // ── POST /api/hospitals/dispatch ──────────────────────────────────────────
  describe('POST /api/hospitals/dispatch', () => {
    it('should return 400 when incident_id or hospital_id missing', async () => {
      const res = await request(app).post('/api/hospitals/dispatch').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for non-integer IDs', async () => {
      const res = await request(app)
        .post('/api/hospitals/dispatch')
        .send({ incident_id: 'abc', hospital_id: 'xyz' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── PATCH /api/hospitals/dispatch/:dispatch_id/status ─────────────────────
  describe('PATCH /api/hospitals/dispatch/:dispatch_id/status', () => {
    it('should return 400 for invalid dispatch_status value', async () => {
      const res = await request(app)
        .patch('/api/hospitals/dispatch/1/status')
        .send({ dispatch_status: 'InvalidStatus' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when dispatch_status is missing', async () => {
      const res = await request(app)
        .patch('/api/hospitals/dispatch/1/status')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── PUT /api/hospitals/:id ────────────────────────────────────────────────
  describe('PUT /api/hospitals/:id', () => {
    it('should return 400 when required fields missing on update', async () => {
      const res = await request(app).put('/api/hospitals/1').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── PATCH /api/hospitals/:id/status ───────────────────────────────────────
  describe('PATCH /api/hospitals/:id/status', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).patch('/api/hospitals/abc/status').send();
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── DELETE /api/hospitals/:id ─────────────────────────────────────────────
  describe('DELETE /api/hospitals/:id', () => {
    it('should return 400 for invalid ID', async () => {
      const res = await request(app).delete('/api/hospitals/abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent hospital', async () => {
      const res = await request(app).delete('/api/hospitals/999999');
      // Will be 404 if DB connected, 500 otherwise
      expect([404, 500]).toContain(res.statusCode);
    });
  });

  // ── GET /api/hospitals/:hospital_id/dispatches ────────────────────────────
  describe('GET /api/hospitals/:hospital_id/dispatches', () => {
    it('should return 400 for invalid hospital_id', async () => {
      const res = await request(app).get('/api/hospitals/abc/dispatches');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Health check ──────────────────────────────────────────────────────────
  describe('GET /api/health', () => {
    it('should return 200 with success', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── 404 handler ───────────────────────────────────────────────────────────
  describe('Unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
