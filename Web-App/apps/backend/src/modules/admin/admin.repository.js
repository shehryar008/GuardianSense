const supabase = require('../../config/db');

// ─── Admin Auth ───────────────────────────────────────────────────────────────

const findAdminByEmail = async (email) => {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

const getDashboardStats = async () => {
  const [hospitals, policeStations, activeIncidents, resolvedIncidents, dispatches, users] =
    await Promise.all([
      supabase.from('hospitals').select('hospital_id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('police_stations').select('station_id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('incidents').select('incident_id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('incidents').select('incident_id', { count: 'exact', head: true }).eq('is_active', false),
      supabase.from('incident_dispatch').select('dispatch_id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

  return {
    active_hospitals: hospitals.count || 0,
    active_police_stations: policeStations.count || 0,
    active_incidents: activeIncidents.count || 0,
    resolved_incidents: resolvedIncidents.count || 0,
    total_users: users.count || 0,
    total_dispatches: dispatches.count || 0,
  };
};

// ─── Hospitals ────────────────────────────────────────────────────────────────

const findAllHospitals = async () => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('hospital_id', { ascending: true });

  if (error) throw error;
  return data;
};

const findHospitalById = async (id) => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('hospital_id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

const toggleHospitalStatus = async (id) => {
  const hospital = await findHospitalById(id);
  if (!hospital) return null;

  const { data, error } = await supabase
    .from('hospitals')
    .update({ is_active: !hospital.is_active })
    .eq('hospital_id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ─── Police Stations ──────────────────────────────────────────────────────────

const findAllPoliceStations = async () => {
  const { data, error } = await supabase
    .from('police_stations')
    .select('*')
    .order('station_id', { ascending: true });

  if (error) throw error;
  return data;
};

const findPoliceStationById = async (id) => {
  const { data, error } = await supabase
    .from('police_stations')
    .select('*')
    .eq('station_id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

const togglePoliceStationStatus = async (id) => {
  const station = await findPoliceStationById(id);
  if (!station) return null;

  const { data, error } = await supabase
    .from('police_stations')
    .update({ is_active: !station.is_active })
    .eq('station_id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ─── Incidents ────────────────────────────────────────────────────────────────

const findAllIncidents = async ({ status, from_date, to_date } = {}) => {
  let query = supabase
    .from('incidents')
    .select('*, incident_dispatch(dispatch_id, responder_type, hospital_id, station_id, dispatch_status, dispatched_at)')
    .order('detected_at', { ascending: false });

  if (status === 'active') query = query.eq('is_active', true);
  if (status === 'resolved') query = query.eq('is_active', false);
  if (from_date) query = query.gte('detected_at', from_date);
  if (to_date) query = query.lte('detected_at', to_date);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const findIncidentById = async (id) => {
  const { data: incident, error } = await supabase
    .from('incidents')
    .select('*, incident_dispatch(dispatch_id, incident_id, responder_type, hospital_id, station_id, dispatch_status, dispatched_at)')
    .eq('incident_id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;

  // Manually look up hospital/police names (no FK relationship in DB)
  if (incident && incident.incident_dispatch) {
    for (const dispatch of incident.incident_dispatch) {
      if (dispatch.hospital_id) {
        const { data: hosp } = await supabase.from('hospitals').select('hospital_name, phone').eq('hospital_id', dispatch.hospital_id).maybeSingle();
        dispatch.hospitals = hosp;
      }
      if (dispatch.station_id) {
        const { data: station } = await supabase.from('police_stations').select('station_name, phone').eq('station_id', dispatch.station_id).maybeSingle();
        dispatch.police_stations = station;
      }
    }
  }

  return incident;
};

// ─── Users ────────────────────────────────────────────────────────────────────

const findAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) throw error;
  
  return data.map(profile => ({
    user_id: profile.id,
    name: profile.full_name,
    email: profile.email,
    phone: profile.phone_number,
    address: profile.address,
    blood_type: profile.blood_type,
    medical_conditions: profile.allergies,
    registered_at: profile.updated_at || profile.created_at || new Date().toISOString()
  }));
};

// ─── Reports ──────────────────────────────────────────────────────────────────

const getReportData = async ({ from_date, to_date, department } = {}) => {
  // Get incidents with dispatch info
  let query = supabase
    .from('incidents')
    .select('incident_id, is_active, detected_at, incident_dispatch(dispatch_id, responder_type, dispatch_status, dispatched_at)')
    .order('detected_at', { ascending: false });

  if (from_date) query = query.gte('detected_at', from_date);
  if (to_date) query = query.lte('detected_at', to_date);

  const { data: incidents, error } = await query;
  if (error) throw error;

  // Filter by department if specified
  let filteredIncidents = incidents;
  if (department === 'Hospital' || department === 'Police') {
    filteredIncidents = incidents.filter((inc) =>
      inc.incident_dispatch.some((d) => d.responder_type === department)
    );
  }

  // Aggregate stats
  const totalIncidents = filteredIncidents.length;
  const resolvedIncidents = filteredIncidents.filter((i) => !i.is_active).length;
  const activeIncidents = filteredIncidents.filter((i) => i.is_active).length;

  const hospitalDispatches = filteredIncidents.reduce(
    (count, inc) => count + inc.incident_dispatch.filter((d) => d.responder_type === 'Hospital').length,
    0
  );
  const policeDispatches = filteredIncidents.reduce(
    (count, inc) => count + inc.incident_dispatch.filter((d) => d.responder_type === 'Police').length,
    0
  );

  return {
    total_incidents: totalIncidents,
    resolved_incidents: resolvedIncidents,
    active_incidents: activeIncidents,
    hospital_dispatches: hospitalDispatches,
    police_dispatches: policeDispatches,
    incidents: filteredIncidents.slice(0, 50), // Limit for report view
  };
};

// ─── Activity Log ─────────────────────────────────────────────────────────────

const getActivityLog = async (limit = 50) => {
  // Combine recent incidents and dispatches as activity entries
  const [incidentsResult, dispatchesResult] = await Promise.all([
    supabase
      .from('incidents')
      .select('incident_id, is_active, detected_at')
      .order('detected_at', { ascending: false })
      .limit(limit),
    supabase
      .from('incident_dispatch')
      .select('dispatch_id, responder_type, dispatch_status, dispatched_at, hospital_id, station_id')
      .order('dispatched_at', { ascending: false })
      .limit(limit),
  ]);

  if (incidentsResult.error) throw incidentsResult.error;
  if (dispatchesResult.error) throw dispatchesResult.error;

  // Fetch hospital and police station names separately (no FK in DB)
  const hospitalIds = [...new Set(dispatchesResult.data.filter(d => d.hospital_id).map(d => d.hospital_id))];
  const stationIds = [...new Set(dispatchesResult.data.filter(d => d.station_id).map(d => d.station_id))];

  const [hospitalsRes, stationsRes] = await Promise.all([
    hospitalIds.length > 0
      ? supabase.from('hospitals').select('hospital_id, hospital_name').in('hospital_id', hospitalIds)
      : { data: [] },
    stationIds.length > 0
      ? supabase.from('police_stations').select('station_id, station_name').in('station_id', stationIds)
      : { data: [] },
  ]);

  const hospitalMap = {};
  (hospitalsRes.data || []).forEach(h => { hospitalMap[h.hospital_id] = h.hospital_name; });
  const stationMap = {};
  (stationsRes.data || []).forEach(s => { stationMap[s.station_id] = s.station_name; });

  // Transform into activity log entries
  const activities = [];

  for (const incident of incidentsResult.data) {
    activities.push({
      type: 'incident',
      title: incident.is_active
        ? `New incident reported`
        : `Incident #${incident.incident_id} resolved`,
      category: 'Incident',
      actor: 'System',
      timestamp: incident.detected_at,
    });
  }

  for (const dispatch of dispatchesResult.data) {
    const responderName = dispatch.responder_type === 'Hospital'
      ? hospitalMap[dispatch.hospital_id] || 'Unknown'
      : stationMap[dispatch.station_id] || 'Unknown';

    activities.push({
      type: 'dispatch',
      title: `${dispatch.responder_type} dispatched: ${responderName} (${dispatch.dispatch_status})`,
      category: dispatch.responder_type === 'Hospital' ? 'Medical' : 'Police',
      actor: 'Dispatch',
      timestamp: dispatch.dispatched_at,
    });
  }

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return activities.slice(0, limit);
};

module.exports = {
  findAdminByEmail,
  getDashboardStats,
  findAllHospitals,
  findHospitalById,
  toggleHospitalStatus,
  findAllPoliceStations,
  findPoliceStationById,
  togglePoliceStationStatus,
  findAllIncidents,
  findIncidentById,
  findAllUsers,
  getReportData,
  getActivityLog,
};
