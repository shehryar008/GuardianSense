const express = require('express');
const router = express.Router();
const controller = require('./hospital.controller');
const validator = require('./hospital.validator');

// ─── Hospital Management ──────────────────────────────────────────────────────

// POST /api/hospitals/dispatch must come BEFORE /:id to avoid treating "dispatch" as an :id
router.post('/dispatch', validator.validateCreateDispatch, controller.createDispatch);

// GET /api/hospitals/dispatch/:incident_id
router.get('/dispatch/:incident_id', validator.validateIncidentId, controller.getDispatchForIncident);

// PATCH /api/hospitals/dispatch/:dispatch_id/status
router.patch('/dispatch/:dispatch_id/status', validator.validateUpdateDispatchStatus, controller.updateDispatchStatus);

// GET /api/hospitals/incidents/active — all active incidents (for hospital dispatch view)
router.get('/incidents/active', controller.getActiveIncidents);

// GET /api/hospitals
router.get('/', controller.getAllHospitals);

// POST /api/hospitals
router.post('/', validator.validateCreateHospital, controller.createHospital);

// GET /api/hospitals/:hospital_id/dispatches — MUST come BEFORE /:id
router.get('/:hospital_id/dispatches', validator.validateHospitalIdParam, controller.getDispatchesByHospital);

// PATCH /api/hospitals/:id/status — MUST come BEFORE /:id
router.patch('/:id/status', validator.validateHospitalId, controller.toggleStatus);

// GET /api/hospitals/:id
router.get('/:id', validator.validateHospitalId, controller.getHospitalById);

// PUT /api/hospitals/:id
router.put('/:id', validator.validateUpdateHospital, controller.updateHospital);

// DELETE /api/hospitals/:id
router.delete('/:id', validator.validateHospitalId, controller.deleteHospital);

module.exports = router;
