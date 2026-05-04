require('dotenv').config();
const env = require('./src/config/env');

const express = require('express');
const cors = require('cors');
const hospitalRoutes = require('./src/modules/hospital/hospital.routes');
const authRoutes = require('./src/modules/auth/auth.routes');
const adminRoutes = require('./src/modules/admin/admin.routes');
const policeRoutes = require('./src/modules/police/police.routes');

const app = express();
const PORT = env.port;

// Middleware
app.use(cors({
  origin: [
    env.frontendUrl,
    env.adminFrontendUrl,
    env.policeFrontendUrl,
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'GuardianSense Hospital API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/police', policeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server (only when not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
