const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('./admin.repository');

const JWT_SECRET = process.env.JWT_SECRET || 'guardiansense-admin-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

// ─── Auth ─────────────────────────────────────────────────────────────────────

const loginAdmin = async (email, password) => {
  const admin = await repository.findAdminByEmail(email);
  if (!admin) {
    return { success: false, status: 401, message: 'Invalid email or password' };
  }

  let isMatch = false;
  if (admin.password_hash.startsWith('$2')) {
    isMatch = await bcrypt.compare(password, admin.password_hash);
  } else {
    // Fallback for plaintext dummy hashes in the seeded database (e.g. 'admin_hash_1')
    isMatch = password === admin.password_hash;
  }
  
  if (!isMatch) {
    return { success: false, status: 401, message: 'Invalid email or password' };
  }

  const token = jwt.sign(
    { admin_id: admin.admin_id, email: admin.email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  return {
    success: true,
    data: {
      admin: {
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
      },
      token,
    },
  };
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const getDashboardStats = async () => {
  return await repository.getDashboardStats();
};

// ─── Hospitals ────────────────────────────────────────────────────────────────

const getAllHospitals = async () => {
  return await repository.findAllHospitals();
};

const getHospitalById = async (id) => {
  const hospital = await repository.findHospitalById(id);
  if (!hospital) {
    return { success: false, status: 404, message: 'Hospital not found' };
  }
  return { success: true, data: hospital };
};

const toggleHospitalStatus = async (id) => {
  const hospital = await repository.toggleHospitalStatus(id);
  if (!hospital) {
    return { success: false, status: 404, message: 'Hospital not found' };
  }
  return { success: true, data: hospital };
};

// ─── Police Stations ──────────────────────────────────────────────────────────

const getAllPoliceStations = async () => {
  return await repository.findAllPoliceStations();
};

const getPoliceStationById = async (id) => {
  const station = await repository.findPoliceStationById(id);
  if (!station) {
    return { success: false, status: 404, message: 'Police station not found' };
  }
  return { success: true, data: station };
};

const togglePoliceStationStatus = async (id) => {
  const station = await repository.togglePoliceStationStatus(id);
  if (!station) {
    return { success: false, status: 404, message: 'Police station not found' };
  }
  return { success: true, data: station };
};

// ─── Incidents ────────────────────────────────────────────────────────────────

const getAllIncidents = async (filters) => {
  return await repository.findAllIncidents(filters);
};

const getIncidentById = async (id) => {
  const incident = await repository.findIncidentById(id);
  if (!incident) {
    return { success: false, status: 404, message: 'Incident not found' };
  }
  return { success: true, data: incident };
};

// ─── Users ────────────────────────────────────────────────────────────────────

const getAllUsers = async () => {
  return await repository.findAllUsers();
};

// ─── Reports ──────────────────────────────────────────────────────────────────

const getReportData = async (filters) => {
  return await repository.getReportData(filters);
};

// ─── Activity Log ─────────────────────────────────────────────────────────────

const getActivityLog = async (limit) => {
  return await repository.getActivityLog(limit);
};

module.exports = {
  loginAdmin,
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
