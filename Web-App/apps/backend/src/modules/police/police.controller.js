const service = require('./police.service');

const handleError = (res, error, defaultMessage) => {
  console.error(`[Police Controller] Error:`, error);
  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status >= 500 ? defaultMessage : error.message,
    error: error.message,
  });
};

const getAllStations = async (req, res) => {
  try {
    const stations = await service.getAllStations();
    res.json({
      success: true,
      message: 'Police stations retrieved successfully',
      data: stations,
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve police stations');
  }
};

const getStationById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const station = await service.getStationById(id);
    res.json({
      success: true,
      message: 'Police station retrieved successfully',
      data: station,
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve police station');
  }
};

const createStation = async (req, res) => {
  try {
    const station = await service.createStation(req.body);
    res.status(201).json({
      success: true,
      message: 'Police station created successfully',
      data: station,
    });
  } catch (error) {
    handleError(res, error, 'Failed to create police station');
  }
};

const updateStation = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const station = await service.updateStation(id, req.body);
    res.json({
      success: true,
      message: 'Police station updated successfully',
      data: station,
    });
  } catch (error) {
    handleError(res, error, 'Failed to update police station');
  }
};

const toggleStationStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const station = await service.toggleStationStatus(id);
    res.json({
      success: true,
      message: 'Police station status toggled successfully',
      data: station,
    });
  } catch (error) {
    handleError(res, error, 'Failed to toggle police station status');
  }
};

const deleteStation = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const station = await service.deleteStation(id);
    res.json({
      success: true,
      message: 'Police station deleted successfully',
      data: station,
    });
  } catch (error) {
    handleError(res, error, 'Failed to delete police station');
  }
};

// ─── Dispatch Endpoints ──────────────────────────────────────────────────────

const getActiveIncidents = async (req, res) => {
  try {
    const incidents = await service.getAllActiveIncidents();
    res.json({
      success: true,
      message: 'Active incidents retrieved successfully',
      data: incidents,
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve active incidents');
  }
};

const createDispatch = async (req, res) => {
  try {
    const dispatch = await service.createDispatch(req.body);
    res.status(201).json({
      success: true,
      message: 'Dispatch created successfully',
      data: dispatch,
    });
  } catch (error) {
    handleError(res, error, 'Failed to create dispatch');
  }
};

const getDispatchForIncident = async (req, res) => {
  try {
    const incidentId = parseInt(req.params.incident_id, 10);
    const dispatch = await service.getDispatchForIncident(incidentId);
    res.json({
      success: true,
      message: 'Dispatch retrieved successfully',
      data: dispatch,
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve dispatch');
  }
};

const updateDispatchStatus = async (req, res) => {
  try {
    const dispatchId = parseInt(req.params.dispatch_id, 10);
    const { dispatch_status } = req.body;
    const dispatch = await service.updateDispatchStatus(dispatchId, dispatch_status);
    res.json({
      success: true,
      message: 'Dispatch status updated successfully',
      data: dispatch,
    });
  } catch (error) {
    handleError(res, error, 'Failed to update dispatch status');
  }
};

const getDispatchesByStation = async (req, res) => {
  try {
    const stationId = parseInt(req.params.station_id, 10);
    const dispatches = await service.getDispatchesByStation(stationId);
    res.json({
      success: true,
      message: 'Police station dispatches retrieved successfully',
      data: dispatches,
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve police station dispatches');
  }
};

module.exports = {
  getAllStations,
  getStationById,
  createStation,
  updateStation,
  toggleStationStatus,
  deleteStation,
  getActiveIncidents,
  createDispatch,
  getDispatchForIncident,
  updateDispatchStatus,
  getDispatchesByStation,
};
