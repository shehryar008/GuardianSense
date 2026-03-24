const service = require('./admin.service');

// ─── Auth ─────────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await service.loginAdmin(email, password);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: result.data,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
  try {
    const stats = await service.getDashboardStats();
    res.json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: stats,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ─── Hospitals ────────────────────────────────────────────────────────────────

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await service.getAllHospitals();
    res.json({
      success: true,
      message: 'Hospitals retrieved',
      data: hospitals,
    });
  } catch (err) {
    console.error('Get hospitals error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const result = await service.getHospitalById(parseInt(req.params.id));
    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }
    res.json({
      success: true,
      message: 'Hospital retrieved',
      data: result.data,
    });
  } catch (err) {
    console.error('Get hospital error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const toggleHospitalStatus = async (req, res) => {
  try {
    const result = await service.toggleHospitalStatus(parseInt(req.params.id));
    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }
    res.json({
      success: true,
      message: `Hospital ${result.data.is_active ? 'activated' : 'deactivated'} successfully`,
      data: result.data,
    });
  } catch (err) {
    console.error('Toggle hospital status error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ─── Police Stations ──────────────────────────────────────────────────────────

const getAllPoliceStations = async (req, res) => {
  try {
    const stations = await service.getAllPoliceStations();
    res.json({
      success: true,
      message: 'Police stations retrieved',
      data: stations,
    });
  } catch (err) {
    console.error('Get police stations error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getPoliceStationById = async (req, res) => {
  try {
    const result = await service.getPoliceStationById(parseInt(req.params.id));
    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }
    res.json({
      success: true,
      message: 'Police station retrieved',
      data: result.data,
    });
  } catch (err) {
    console.error('Get police station error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const togglePoliceStationStatus = async (req, res) => {
  try {
    const result = await service.togglePoliceStationStatus(parseInt(req.params.id));
    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }
    res.json({
      success: true,
      message: `Police station ${result.data.is_active ? 'activated' : 'deactivated'} successfully`,
      data: result.data,
    });
  } catch (err) {
    console.error('Toggle police station status error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ─── Incidents ────────────────────────────────────────────────────────────────

const getAllIncidents = async (req, res) => {
  try {
    const { status, from_date, to_date } = req.query;
    const incidents = await service.getAllIncidents({ status, from_date, to_date });
    res.json({
      success: true,
      message: 'Incidents retrieved',
      data: incidents,
    });
  } catch (err) {
    console.error('Get incidents error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getIncidentById = async (req, res) => {
  try {
    const result = await service.getIncidentById(parseInt(req.params.id));
    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }
    res.json({
      success: true,
      message: 'Incident retrieved',
      data: result.data,
    });
  } catch (err) {
    console.error('Get incident error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const users = await service.getAllUsers();
    res.json({
      success: true,
      message: 'Users retrieved',
      data: users,
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ─── Reports ──────────────────────────────────────────────────────────────────

const getReportData = async (req, res) => {
  try {
    const { from_date, to_date, department } = req.query;
    const report = await service.getReportData({ from_date, to_date, department });
    res.json({
      success: true,
      message: 'Report data retrieved',
      data: report,
    });
  } catch (err) {
    console.error('Get report data error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ─── Activity Log ─────────────────────────────────────────────────────────────

const getActivityLog = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activities = await service.getActivityLog(limit);
    res.json({
      success: true,
      message: 'Activity log retrieved',
      data: activities,
    });
  } catch (err) {
    console.error('Get activity log error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

module.exports = {
  login,
  getDashboardStats,
  getAllHospitals,
  getHospitalById,
  toggleHospitalStatus,
  getAllPoliceStations,
  getPoliceStationById,
  togglePoliceStationStatus,
  getAllIncidents,
  getIncidentById,
  getAllUsers,
  getReportData,
  getActivityLog,
};
