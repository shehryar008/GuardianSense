const express = require('express');
const router = express.Router();
const controller = require('./admin.controller');
const validator = require('./admin.validator');
const adminAuth = require('../../middleware/adminAuth');

// ─── Public Routes ────────────────────────────────────────────────────────────

// POST /api/admin/login
router.post('/login', validator.validateLogin, controller.login);

// ─── Protected Routes (require admin JWT) ─────────────────────────────────────

router.use(adminAuth); // All routes below require authentication

// Dashboard
router.get('/dashboard/stats', controller.getDashboardStats);

// Hospitals
router.get('/hospitals', controller.getAllHospitals);
router.get('/hospitals/:id', validator.validateIdParam, controller.getHospitalById);
router.patch('/hospitals/:id/status', validator.validateIdParam, controller.toggleHospitalStatus);

// Police Stations
router.get('/police-stations', controller.getAllPoliceStations);
router.get('/police-stations/:id', validator.validateIdParam, controller.getPoliceStationById);
router.patch('/police-stations/:id/status', validator.validateIdParam, controller.togglePoliceStationStatus);

// Incidents
router.get('/incidents', validator.validateIncidentFilters, controller.getAllIncidents);
router.get('/incidents/:id', validator.validateIdParam, controller.getIncidentById);

// Users
router.get('/users', controller.getAllUsers);

// Reports
router.get('/reports', validator.validateReportFilters, controller.getReportData);

// Activity Log
router.get('/activity-log', controller.getActivityLog);

module.exports = router;
