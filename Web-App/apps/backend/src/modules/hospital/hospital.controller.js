const { validationResult } = require('express-validator');
const service = require('./hospital.service');

// Helper to handle validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((e) => e.msg).join(', '),
    });
    return false;
  }
  return true;
};

// ─── Hospital CRUD ────────────────────────────────────────────────────────────

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await service.getAllHospitals();
    res.json({ success: true, message: 'Hospitals retrieved successfully', data: hospitals });
  } catch (err) {
    console.error('getAllHospitals error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const hospital = await service.getHospitalById(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Hospital retrieved successfully', data: hospital });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message, error: err.message });
  }
};

const createHospital = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const hospital = await service.createHospital(req.body);
    res.status(201).json({ success: true, message: 'Hospital created successfully', data: hospital });
  } catch (err) {
    console.error('createHospital error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

const updateHospital = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const hospital = await service.updateHospital(parseInt(req.params.id, 10), req.body);
    res.json({ success: true, message: 'Hospital updated successfully', data: hospital });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message, error: err.message });
  }
};

const toggleStatus = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const hospital = await service.toggleHospitalStatus(parseInt(req.params.id, 10));
    res.json({ success: true, message: `Hospital ${hospital.is_active ? 'activated' : 'deactivated'} successfully`, data: hospital });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message, error: err.message });
  }
};

const deleteHospital = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const hospital = await service.deleteHospital(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Hospital deleted (deactivated) successfully', data: hospital });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message, error: err.message });
  }
};

// ─── Active Incidents ───────────────────────────────────────────────────────

const getActiveIncidents = async (req, res) => {
  try {
    const incidents = await service.getAllActiveIncidents();
    res.json({ success: true, message: 'Active incidents retrieved successfully', data: incidents });
  } catch (err) {
    console.error('getActiveIncidents error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

// ─── Dispatch ─────────────────────────────────────────────────────────────────

const createDispatch = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const dispatch = await service.createDispatch(req.body);
    res.status(201).json({ success: true, message: 'Hospital dispatched successfully', data: dispatch });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message, error: err.message });
  }
};

const getDispatchForIncident = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const dispatches = await service.getDispatchForIncident(parseInt(req.params.incident_id, 10));
    res.json({ success: true, message: 'Dispatch info retrieved successfully', data: dispatches });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message, error: err.message });
  }
};

const updateDispatchStatus = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const dispatch = await service.updateDispatchStatus(parseInt(req.params.dispatch_id, 10), req.body.dispatch_status);
    res.json({ success: true, message: `Dispatch status updated to '${dispatch.dispatch_status}'`, data: dispatch });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message, error: err.message });
  }
};

const getDispatchesByHospital = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const dispatches = await service.getDispatchesByHospital(parseInt(req.params.hospital_id, 10));
    res.json({ success: true, message: 'Hospital dispatches retrieved successfully', data: dispatches });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message, error: err.message });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  toggleStatus,
  deleteHospital,
  getActiveIncidents,
  createDispatch,
  getDispatchForIncident,
  updateDispatchStatus,
  getDispatchesByHospital,
};
