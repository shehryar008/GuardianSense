const request = require('supertest');
const app = require('../../../server'); // Adjust path to server.js
const supabase = require('../../config/db');

// Mock supabase
jest.mock('../../config/db', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
}));



describe('Police Station API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/police', () => {
    it('should return 200 and an array of active stations', async () => {
      const mockStations = [{ station_id: 1, station_name: 'Central Police' }];
      supabase.order.mockResolvedValueOnce({ data: mockStations, error: null });

      const res = await request(app).get('/api/police');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].station_name).toBe('Central Police');
    });
  });

  describe('POST /api/police', () => {
    it('should return 201 when station is created with valid data', async () => {
      const mockStation = { station_id: 1, station_name: 'Test Police', email: 'test@police.com' };
      supabase.single.mockResolvedValueOnce({ data: mockStation, error: null });

      const validData = {
        station_name: 'Test Police',
        address: '123 Test St',
        city: 'Testville',
        phone: '1234567890',
        email: 'test@police.com',
        password: 'password123'
      };

      const res = await request(app).post('/api/police').send(validData);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.station_name).toBe('Test Police');
    });

    it('should return 400 when missing required fields', async () => {
      const invalidData = { station_name: 'Test Police' }; // missing other fields

      const res = await request(app).post('/api/police').send(invalidData);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/police/:id', () => {
    it('should return 200 and the station for a valid ID', async () => {
      const mockStation = { station_id: 1, station_name: 'Test Police' };
      supabase.maybeSingle.mockResolvedValueOnce({ data: mockStation, error: null });

      const res = await request(app).get('/api/police/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.station_name).toBe('Test Police');
    });

    it('should return 404 for an invalid ID', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const res = await request(app).get('/api/police/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/police/dispatch', () => {
    it('should return 201 when dispatch is created successfully', async () => {
      // Mock incident check (active)
      supabase.maybeSingle.mockResolvedValueOnce({ data: { incident_id: 1, is_active: true }, error: null });
      // Mock station check (active)
      supabase.maybeSingle.mockResolvedValueOnce({ data: { station_id: 1, is_active: true }, error: null });
      // Mock duplicate check (none)
      supabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      // Mock create
      supabase.single.mockResolvedValueOnce({ data: { dispatch_id: 1 }, error: null });

      const res = await request(app).post('/api/police/dispatch').send({ incident_id: 1, station_id: 1 });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 409 if police is already dispatched to the incident', async () => {
      // Mock incident check (active)
      supabase.maybeSingle.mockResolvedValueOnce({ data: { incident_id: 1, is_active: true }, error: null });
      // Mock station check (active)
      supabase.maybeSingle.mockResolvedValueOnce({ data: { station_id: 1, is_active: true }, error: null });
      // Mock duplicate check (exists)
      supabase.maybeSingle.mockResolvedValueOnce({ data: { dispatch_id: 1 }, error: null });

      const res = await request(app).post('/api/police/dispatch').send({ incident_id: 1, station_id: 1 });
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400/404 if incident is inactive or missing', async () => {
      // Mock incident check (inactive)
      supabase.maybeSingle.mockResolvedValueOnce({ data: { incident_id: 1, is_active: false }, error: null });

      const res = await request(app).post('/api/police/dispatch').send({ incident_id: 1, station_id: 1 });
      expect(res.statusCode).toBe(400); // 400 for inactive
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /dispatch/:id/status', () => {
    it('should return 200 for a valid transition (Pending -> En Route)', async () => {
      // Mock get dispatch
      supabase.maybeSingle.mockResolvedValueOnce({ data: { dispatch_id: 1, dispatch_status: 'Pending' }, error: null });
      // Mock update
      supabase.single.mockResolvedValueOnce({ data: { dispatch_id: 1, dispatch_status: 'En Route' }, error: null });

      const res = await request(app).patch('/api/police/dispatch/1/status').send({ dispatch_status: 'En Route' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 422 for an invalid transition (Pending -> Resolved)', async () => {
      // Mock get dispatch
      supabase.maybeSingle.mockResolvedValueOnce({ data: { dispatch_id: 1, dispatch_status: 'Pending' }, error: null });

      const res = await request(app).patch('/api/police/dispatch/1/status').send({ dispatch_status: 'Resolved' });
      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/police/incidents/active', () => {
    it('should return 200 and only active incidents', async () => {
      supabase.order.mockResolvedValueOnce({ data: [{ incident_id: 1, is_active: true }], error: null });

      const res = await request(app).get('/api/police/incidents/active');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].is_active).toBe(true);
    });
  });

  describe('GET /api/police/:station_id/dispatches', () => {
    it('should return 200 and include incidents join', async () => {
      // Mock get station
      supabase.maybeSingle.mockResolvedValueOnce({ data: { station_id: 1 }, error: null });
      // Mock get dispatches
      supabase.order.mockResolvedValueOnce({ 
        data: [{ dispatch_id: 1, incidents: { latitude: 0, longitude: 0 } }], 
        error: null 
      });

      const res = await request(app).get('/api/police/1/dispatches');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].incidents).toBeDefined();
    });
  });
});
