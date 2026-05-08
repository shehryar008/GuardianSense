"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { fetchDashboardStats, fetchHospitals, fetchPoliceStations, fetchIncidents, DashboardStats, Hospital, PoliceStation, Incident } from "../../lib/api"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [stations, setStations] = useState<PoliceStation[]>([])
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, hospRes, polRes, incRes] = await Promise.all([
          fetchDashboardStats(),
          fetchHospitals(),
          fetchPoliceStations(),
          fetchIncidents({ status: 'active' })
        ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (hospRes.success && hospRes.data) setHospitals(hospRes.data);
        if (polRes.success && polRes.data) setStations(polRes.data);
        if (incRes.success && incRes.data) setRecentIncidents(incRes.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Active Facilities</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active_hospitals + stats.active_police_stations}</p>
                    <div className="text-xs text-gray-500 mt-2">{stats.active_hospitals} Hosp / {stats.active_police_stations} Police</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Active Incidents</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.active_incidents}</p>
                    <div className="text-xs text-green-600 mt-2">{stats.resolved_incidents} Resolved total</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Total Dispatches</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total_dispatches}</p>
                    <div className="text-xs text-gray-500 mt-2">Across all facilities</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Registered Users</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{stats.total_users}</p>
                    <div className="text-xs text-gray-500 mt-2">Active platform users</div>
                  </div>
                </div>
              )}

              {/* Recent Active Incidents */}
              <div className="bg-white rounded-xl border border-gray-200 mb-6">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Recent Active Incidents</h3>
                  <p className="text-xs text-gray-500 mt-1">Latest incidents detected by the system</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">ID</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Location</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Detected At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentIncidents.length > 0 ? recentIncidents.map((inc) => (
                        <tr key={inc.incident_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-5 text-sm font-mono text-gray-700">#{inc.incident_id}</td>
                          <td className="py-3 px-5 text-sm text-gray-600">{inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}</td>
                          <td className="py-3 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${inc.is_active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${inc.is_active ? 'bg-red-500' : 'bg-green-500'}`} />
                              {inc.is_active ? 'Active' : 'Resolved'}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-500">{new Date(inc.detected_at).toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="py-6 text-center text-sm text-gray-500">No active incidents</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Facilities Overview */}
              <div className="grid grid-cols-2 gap-6">
                {/* Hospitals */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Hospitals</h3>
                    <p className="text-xs text-gray-500 mt-1">{hospitals.filter(h => h.is_active).length} active of {hospitals.length} total</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {hospitals.map((h) => (
                      <div key={h.hospital_id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{h.hospital_name}</p>
                          <p className="text-xs text-gray-500">{h.city} · {h.bed_capacity} beds</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${h.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                          {h.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Police Stations */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Police Stations</h3>
                    <p className="text-xs text-gray-500 mt-1">{stations.filter(s => s.is_active).length} active of {stations.length} total</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {stations.map((s) => (
                      <div key={s.station_id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.station_name}</p>
                          <p className="text-xs text-gray-500">{s.city}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
