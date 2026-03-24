const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class AdminApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (response.status === 401) {
      // Token expired or invalid — clear and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }

    return data;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body: unknown, includeAuth = true): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }
}

export const adminApi = new AdminApiClient(API_BASE_URL);

// ─── Typed API functions ──────────────────────────────────────────────────────

export interface AdminLoginData {
  admin: {
    admin_id: number;
    name: string;
    email: string;
    phone: string;
  };
  token: string;
}

export interface DashboardStats {
  active_hospitals: number;
  active_police_stations: number;
  active_incidents: number;
  resolved_incidents: number;
  total_users: number;
  total_dispatches: number;
}

export interface Hospital {
  hospital_id: number;
  hospital_name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  bed_capacity: number;
  is_active: boolean;
  password_hash: string;
}

export interface PoliceStation {
  station_id: number;
  station_name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  is_active: boolean;
  password_hash: string;
}

export interface Incident {
  incident_id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  is_active: boolean;
  detected_at: string;
  resolved_at: string | null;
  users?: { name: string; email: string };
  incident_dispatch?: IncidentDispatch[];
}

export interface IncidentDispatch {
  dispatch_id: number;
  responder_type: string;
  hospital_id: number | null;
  station_id: number | null;
  dispatch_status: string;
  dispatched_at: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  medical_conditions: string;
  registered_at: string;
}

export interface ReportData {
  total_incidents: number;
  resolved_incidents: number;
  active_incidents: number;
  hospital_dispatches: number;
  police_dispatches: number;
  incidents: Incident[];
}

export interface ActivityEntry {
  type: string;
  title: string;
  category: string;
  actor: string;
  timestamp: string;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

export const loginAdmin = (email: string, password: string) =>
  adminApi.post<AdminLoginData>('/api/admin/login', { email, password }, false);

export const fetchDashboardStats = () =>
  adminApi.get<DashboardStats>('/api/admin/dashboard/stats');

export const fetchHospitals = () =>
  adminApi.get<Hospital[]>('/api/admin/hospitals');

export const fetchHospitalById = (id: number) =>
  adminApi.get<Hospital>(`/api/admin/hospitals/${id}`);

export const toggleHospitalStatus = (id: number) =>
  adminApi.patch<Hospital>(`/api/admin/hospitals/${id}/status`);

export const fetchPoliceStations = () =>
  adminApi.get<PoliceStation[]>('/api/admin/police-stations');

export const fetchPoliceStationById = (id: number) =>
  adminApi.get<PoliceStation>(`/api/admin/police-stations/${id}`);

export const togglePoliceStationStatus = (id: number) =>
  adminApi.patch<PoliceStation>(`/api/admin/police-stations/${id}/status`);

export const fetchIncidents = (params?: { status?: string; from_date?: string; to_date?: string }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.from_date) query.set('from_date', params.from_date);
  if (params?.to_date) query.set('to_date', params.to_date);
  const qs = query.toString();
  return adminApi.get<Incident[]>(`/api/admin/incidents${qs ? `?${qs}` : ''}`);
};

export const fetchIncidentById = (id: number) =>
  adminApi.get<Incident>(`/api/admin/incidents/${id}`);

export const fetchUsers = () =>
  adminApi.get<User[]>('/api/admin/users');

export const fetchReports = (params?: { from_date?: string; to_date?: string; department?: string }) => {
  const query = new URLSearchParams();
  if (params?.from_date) query.set('from_date', params.from_date);
  if (params?.to_date) query.set('to_date', params.to_date);
  if (params?.department) query.set('department', params.department);
  const qs = query.toString();
  return adminApi.get<ReportData>(`/api/admin/reports${qs ? `?${qs}` : ''}`);
};

export const fetchActivityLog = (limit?: number) =>
  adminApi.get<ActivityEntry[]>(`/api/admin/activity-log${limit ? `?limit=${limit}` : ''}`);
