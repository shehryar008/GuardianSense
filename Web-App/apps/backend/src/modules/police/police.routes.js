const express = require('express');
const router = express.Router();
const controller = require('./police.controller');
const validator = require('./police.validator');

// ─── Dispatch & Incident Routes (Must be defined before /:id) ───────────────

// GET /api/police/incidents/active
router.get(
  '/incidents/active',
  controller.getActiveIncidents
);

// GET /api/police/:station_id/dispatches
router.get(
  '/:station_id/dispatches',
  validator.validateStationIdParam,
  validator.handleValidationErrors,
  controller.getDispatchesByStation
);

// POST /api/police/dispatch
router.post(
  '/dispatch',
  validator.validateDispatch,
  validator.handleValidationErrors,
  controller.createDispatch
);

// GET /api/police/dispatch/:incident_id
router.get(
  '/dispatch/:incident_id',
  validator.validateIncidentIdParam,
  validator.handleValidationErrors,
  controller.getDispatchForIncident
);

// PATCH /api/police/dispatch/:dispatch_id/status
router.patch(
  '/dispatch/:dispatch_id/status',
  validator.validateDispatchIdParam,
  validator.validateStatusUpdate,
  validator.handleValidationErrors,
  controller.updateDispatchStatus
);

// ─── Police Station CRUD Routes ─────────────────────────────────────────────

// GET /api/police
router.get('/', controller.getAllStations);

// POST /api/police
router.post(
  '/',
  validator.validateCreateStation,
  validator.handleValidationErrors,
  controller.createStation
);

// GET /api/police/:id
router.get(
  '/:id',
  validator.validateStationId,
  validator.handleValidationErrors,
  controller.getStationById
);

// PUT /api/police/:id
router.put(
  '/:id',
  validator.validateStationId,
  validator.validateUpdateStation,
  validator.handleValidationErrors,
  controller.updateStation
);

// PATCH /api/police/:id/status
router.patch(
  '/:id/status',
  validator.validateStationId,
  validator.handleValidationErrors,
  controller.toggleStationStatus
);

// DELETE /api/police/:id
router.delete(
  '/:id',
  validator.validateStationId,
  validator.handleValidationErrors,
  controller.deleteStation
);

module.exports = router;
