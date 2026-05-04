const supabase = require('../../config/db');

const SAFE_STATION_COLUMNS = [
  'station_id', 'station_name', 'address', 'city',
  'phone', 'email', 'is_active'
];

// ─── Police Station CRUD ────────────────────────────────────────────────────────────

const findAllActive = async () => {
  const { data, error } = await supabase
    .from('police_stations')
    .select(SAFE_STATION_COLUMNS.join(', '))
    .eq('is_active', true)
    .order('station_id', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('police_stations')
    .select(SAFE_STATION_COLUMNS.join(', '))
    .eq('station_id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async ({ station_name, address, city, phone, email }) => {
  const { data, error } = await supabase
    .from('police_stations')
    .insert({
      station_name,
      address,
      city,
      phone,
      email,
      password_hash: 'temp_password', // Always hardcoded to temp_password as per requirements
    })
    .select(SAFE_STATION_COLUMNS.join(', '))
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updateData) => {
  // Ensure we don't accidentally update password here either
  if (updateData.password) delete updateData.password;
  if (updateData.password_hash) delete updateData.password_hash;

  const { data, error } = await supabase
    .from('police_stations')
    .update(updateData)
    .eq('station_id', id)
    .select(SAFE_STATION_COLUMNS.join(', '))
    .single();

  if (error) throw error;
  return data;
};

const toggleStatus = async (id) => {
  // First get current status
  const station = await findById(id);
  if (!station) return null;

  const { data, error } = await supabase
    .from('police_stations')
    .update({ is_active: !station.is_active })
    .eq('station_id', id)
    .select(SAFE_STATION_COLUMNS.join(', '))
    .single();

  if (error) throw error;
  return data;
};

const softDelete = async (id) => {
  const { data, error } = await supabase
    .from('police_stations')
    .update({ is_active: false })
    .eq('station_id', id)
    .select(SAFE_STATION_COLUMNS.join(', '))
    .single();

  if (error) throw error;
  return data;
};

// ─── Incidents & Dispatch ───────────────────────────────────────────────────────────

const findAllActiveIncidents = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('is_active', true)
    .order('detected_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findIncidentById = async (id) => {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('incident_id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const findPoliceDispatchForIncident = async (incidentId) => {
  const { data, error } = await supabase
    .from('incident_dispatch')
    .select('*')
    .eq('incident_id', incidentId)
    .eq('responder_type', 'Police')
    .maybeSingle();

  if (error) throw error;
  return data;
};

const createDispatch = async (incidentId, stationId) => {
  const { data, error } = await supabase
    .from('incident_dispatch')
    .insert({
      incident_id: incidentId,
      responder_type: 'Police',
      hospital_id: null,
      station_id: stationId,
      dispatch_status: 'Pending',
      dispatched_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const findDispatchById = async (id) => {
  const { data, error } = await supabase
    .from('incident_dispatch')
    .select('*')
    .eq('dispatch_id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const updateDispatchStatus = async (dispatchId, status) => {
  const { data, error } = await supabase
    .from('incident_dispatch')
    .update({ dispatch_status: status })
    .eq('dispatch_id', dispatchId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const resolveIncident = async (incidentId) => {
  // DO NOT set resolved_at - column does not exist!
  const { data, error } = await supabase
    .from('incidents')
    .update({ is_active: false })
    .eq('incident_id', incidentId);

  if (error) throw error;
  return data;
};

const findDispatchesForIncident = async (incidentId) => {
  const { data, error } = await supabase
    .from('incident_dispatch')
    .select(`
      *,
      incidents (
        incident_id,
        latitude,
        longitude,
        detected_at,
        is_active
      )
    `)
    .eq('incident_id', incidentId)
    .eq('responder_type', 'Police')
    .order('dispatched_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findDispatchesByStationId = async (stationId) => {
  const { data, error } = await supabase
    .from('incident_dispatch')
    .select(`
      *,
      incidents (
        incident_id,
        latitude,
        longitude,
        detected_at,
        is_active
      )
    `)
    .eq('station_id', stationId)
    .eq('responder_type', 'Police')
    .order('dispatched_at', { ascending: false });

  if (error) throw error;
  return data;
};

module.exports = {
  findAllActive,
  findById,
  create,
  update,
  toggleStatus,
  softDelete,
  findAllActiveIncidents,
  findIncidentById,
  findPoliceDispatchForIncident,
  createDispatch,
  findDispatchById,
  updateDispatchStatus,
  resolveIncident,
  findDispatchesForIncident,
  findDispatchesByStationId,
};
