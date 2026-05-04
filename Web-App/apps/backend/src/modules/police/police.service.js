const repository = require('./police.repository');

// ─── Police Station CRUD ────────────────────────────────────────────────────────────

const getAllStations = async () => {
  return repository.findAllActive();
};

const getStationById = async (id) => {
  const station = await repository.findById(id);
  if (!station) {
    const error = new Error('Police station not found');
    error.statusCode = 404;
    throw error;
  }
  return station;
};

const createStation = async (data) => {
  return repository.create(data);
};

const updateStation = async (id, data) => {
  await getStationById(id);
  return repository.update(id, data);
};

const toggleStationStatus = async (id) => {
  await getStationById(id);
  return repository.toggleStatus(id);
};

const deleteStation = async (id) => {
  await getStationById(id);
  return repository.softDelete(id);
};

// ─── Dispatch Logic ─────────────────────────────────────────────────────────

const getAllActiveIncidents = async () => {
  return repository.findAllActiveIncidents();
};

const VALID_TRANSITIONS = {
  'Pending': 'En Route',
  'En Route': 'Resolved',
};

const createDispatch = async ({ incident_id, station_id }) => {
  // 1. Verify incident exists and is active
  const incident = await repository.findIncidentById(incident_id);
  if (!incident) {
    const error = new Error('Incident not found');
    error.statusCode = 404;
    throw error;
  }
  if (!incident.is_active) {
    const error = new Error('Incident is not active');
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify police station exists and is active
  const station = await repository.findById(station_id);
  if (!station) {
    const error = new Error('Police station not found');
    error.statusCode = 404;
    throw error;
  }
  if (!station.is_active) {
    const error = new Error('Police station is not active');
    error.statusCode = 400;
    throw error;
  }

  // 3. Check for duplicate Police dispatch on this incident
  const existingDispatch = await repository.findPoliceDispatchForIncident(incident_id);
  if (existingDispatch) {
    const error = new Error('Police already dispatched to this incident');
    error.statusCode = 409;
    throw error;
  }

  // 4. Create dispatch
  return repository.createDispatch(incident_id, station_id);
};

const getDispatchForIncident = async (incidentId) => {
  const dispatches = await repository.findDispatchesForIncident(incidentId);
  if (!dispatches || dispatches.length === 0) {
    const error = new Error('No police dispatch found for this incident');
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

const getDispatchesByStation = async (stationId) => {
  // Verify station exists
  await getStationById(stationId);
  return repository.findDispatchesByStationId(stationId);
};

module.exports = {
  getAllStations,
  getStationById,
  createStation,
  updateStation,
  toggleStationStatus,
  deleteStation,
  getAllActiveIncidents,
  createDispatch,
  getDispatchForIncident,
  updateDispatchStatus,
  getDispatchesByStation,
};
