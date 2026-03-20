const repository = require('./hospital.repository');

// ─── Hospital CRUD ────────────────────────────────────────────────────────────

const getAllHospitals = async () => {
  return repository.findAllActive();
};

const getHospitalById = async (id) => {
  const hospital = await repository.findById(id);
  if (!hospital) {
    const error = new Error('Hospital not found');
    error.statusCode = 404;
    throw error;
  }
  return hospital;
};

const createHospital = async (data) => {
  return repository.create(data);
};

const updateHospital = async (id, data) => {
  // Verify hospital exists
  await getHospitalById(id);
  const updated = await repository.update(id, data);
  return updated;
};

const toggleHospitalStatus = async (id) => {
  const hospital = await repository.findById(id);
  if (!hospital) {
    const error = new Error('Hospital not found');
    error.statusCode = 404;
    throw error;
  }
  return repository.toggleStatus(id);
};

const deleteHospital = async (id) => {
  const hospital = await repository.findById(id);
  if (!hospital) {
    const error = new Error('Hospital not found');
    error.statusCode = 404;
    throw error;
  }
  return repository.softDelete(id);
};

// ─── Dispatch Logic ───────────────────────────────────────────────────────────

const VALID_TRANSITIONS = {
  'Pending': 'En Route',
  'En Route': 'Resolved',
};

const createDispatch = async ({ incident_id, hospital_id }) => {
  // 1. Verify incident exists and is active
  const incident = await repository.findIncidentById(incident_id);
  if (!incident) {
    const error = new Error('Incident not found');
    error.statusCode = 404;
    throw error;
  }
  if (!incident.is_active) {
    const error = new Error('Incident is not active');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify hospital exists and is active
  const hospital = await repository.findById(hospital_id);
  if (!hospital) {
    const error = new Error('Hospital not found');
    error.statusCode = 404;
    throw error;
  }
  if (!hospital.is_active) {
    const error = new Error('Hospital is not active');
    error.statusCode = 404;
    throw error;
  }

  // 3. Check for duplicate Hospital dispatch on this incident
  const existingDispatch = await repository.findHospitalDispatchForIncident(incident_id);
  if (existingDispatch) {
    const error = new Error('A hospital has already been dispatched to this incident');
    error.statusCode = 409;
    throw error;
  }

  // 4. Create dispatch
  return repository.createDispatch(incident_id, hospital_id);
};

const getDispatchForIncident = async (incidentId) => {
  const dispatches = await repository.findDispatchesForIncident(incidentId);
  if (!dispatches || dispatches.length === 0) {
    const error = new Error('No hospital dispatch found for this incident');
    error.statusCode = 404;
    throw error;
  }
  return dispatches;
};

const updateDispatchStatus = async (dispatchId, newStatus) => {
  // 1. Get current dispatch
  const dispatch = await repository.findDispatchById(dispatchId);
  if (!dispatch) {
    const error = new Error('Dispatch not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Validate status transition (one-way only)
  const currentStatus = dispatch.dispatch_status;
  const allowedNext = VALID_TRANSITIONS[currentStatus];

  if (allowedNext !== newStatus) {
    const error = new Error(
      `Invalid status transition: cannot change from '${currentStatus}' to '${newStatus}'. Allowed: '${currentStatus}' → '${allowedNext || 'none (already resolved)'}'`
    );
    error.statusCode = 422;
    throw error;
  }

  // 3. Update dispatch status
  const updated = await repository.updateDispatchStatus(dispatchId, newStatus);

  // 4. If resolved, close the incident
  if (newStatus === 'Resolved') {
    await repository.resolveIncident(dispatch.incident_id);
  }

  return updated;
};

const getDispatchesByHospital = async (hospitalId) => {
  // Verify hospital exists
  const hospital = await repository.findById(hospitalId);
  if (!hospital) {
    const error = new Error('Hospital not found');
    error.statusCode = 404;
    throw error;
  }
  return repository.findDispatchesByHospitalId(hospitalId);
};

module.exports = {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  toggleHospitalStatus,
  deleteHospital,
  createDispatch,
  getDispatchForIncident,
  updateDispatchStatus,
  getDispatchesByHospital,
};
