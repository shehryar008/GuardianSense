const supabase = require('../../config/db');

// ─── Hospital CRUD ────────────────────────────────────────────────────────────

const findAllActive = async () => {
  const { data, error } = await supabase
    .from('Hospitals')
    .select('*')
    .eq('is_active', true)
    .order('hospital_id', { ascending: true });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('Hospitals')
    .select('*')
    .eq('hospital_id', id)
    .single();

  if (error && error.code === 'PGRST116') return null; // No rows found
  if (error) throw error;
  return data;
};

const create = async ({ hospital_name, address, city, phone, email, bed_capacity }) => {
  const { data, error } = await supabase
    .from('Hospitals')
    .insert({ hospital_name, address, city, phone, email, bed_capacity })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, { hospital_name, address, city, phone, email, bed_capacity }) => {
  const { data, error } = await supabase
    .from('Hospitals')
    .update({ hospital_name, address, city, phone, email, bed_capacity })
    .eq('hospital_id', id)
    .select()
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

const toggleStatus = async (id) => {
  // First get the current status
  const hospital = await findById(id);
  if (!hospital) return null;

  const { data, error } = await supabase
    .from('Hospitals')
    .update({ is_active: !hospital.is_active })
    .eq('hospital_id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const softDelete = async (id) => {
  const { data, error } = await supabase
    .from('Hospitals')
    .update({ is_active: false })
    .eq('hospital_id', id)
    .select()
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

// ─── Incident Queries ─────────────────────────────────────────────────────────

const findIncidentById = async (incidentId) => {
  const { data, error } = await supabase
    .from('Incidents')
    .select('*')
    .eq('incident_id', incidentId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

// ─── Dispatch Queries ─────────────────────────────────────────────────────────

const findHospitalDispatchForIncident = async (incidentId) => {
  const { data, error } = await supabase
    .from('Incident_Dispatch')
    .select('*')
    .eq('incident_id', incidentId)
    .eq('responder_type', 'Hospital')
    .maybeSingle();

  if (error) throw error;
  return data;
};

const createDispatch = async (incidentId, hospitalId) => {
  const { data, error } = await supabase
    .from('Incident_Dispatch')
    .insert({
      incident_id: incidentId,
      responder_type: 'Hospital',
      hospital_id: hospitalId,
      station_id: null,
      dispatch_status: 'Pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const findDispatchById = async (dispatchId) => {
  const { data, error } = await supabase
    .from('Incident_Dispatch')
    .select('*')
    .eq('dispatch_id', dispatchId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

const updateDispatchStatus = async (dispatchId, status) => {
  const { data, error } = await supabase
    .from('Incident_Dispatch')
    .update({ dispatch_status: status })
    .eq('dispatch_id', dispatchId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const resolveIncident = async (incidentId) => {
  const { error } = await supabase
    .from('Incidents')
    .update({ resolved_at: new Date().toISOString(), is_active: false })
    .eq('incident_id', incidentId);

  if (error) throw error;
};

const findDispatchesByHospitalId = async (hospitalId) => {
  const { data, error } = await supabase
    .from('Incident_Dispatch')
    .select('*, Incidents(latitude, longitude, detected_at, is_active)')
    .eq('hospital_id', hospitalId)
    .eq('responder_type', 'Hospital')
    .order('dispatched_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findDispatchesForIncident = async (incidentId) => {
  const { data, error } = await supabase
    .from('Incident_Dispatch')
    .select('*, Hospitals(hospital_name, phone)')
    .eq('incident_id', incidentId)
    .eq('responder_type', 'Hospital');

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
  findIncidentById,
  findHospitalDispatchForIncident,
  createDispatch,
  findDispatchById,
  updateDispatchStatus,
  resolveIncident,
  findDispatchesByHospitalId,
  findDispatchesForIncident,
};
