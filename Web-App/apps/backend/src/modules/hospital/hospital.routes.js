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

// GET /api/hospitals
router.get('/', controller.getAllHospitals);

// GET /api/hospitals/:id
router.get('/:id', validator.validateHospitalId, controller.getHospitalById);

// POST /api/hospitals
router.post('/', validator.validateCreateHospital, controller.createHospital);

// PUT /api/hospitals/:id
router.put('/:id', validator.validateUpdateHospital, controller.updateHospital);

// PATCH /api/hospitals/:id/status
router.patch('/:id/status', validator.validateHospitalId, controller.toggleStatus);

// DELETE /api/hospitals/:id
router.delete('/:id', validator.validateHospitalId, controller.deleteHospital);

// GET /api/hospitals/:hospital_id/dispatches
router.get('/:hospital_id/dispatches', validator.validateHospitalIdParam, controller.getDispatchesByHospital);

module.exports = router;
