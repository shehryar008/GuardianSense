"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { FacilityCard } from "../../../components/dashboard/facility-card"
import { fetchDashboardStats, fetchHospitals, fetchPoliceStations, DashboardStats, Hospital, PoliceStation } from "../../lib/api"

// Helper function to calculate a mock "score" since the DB schema doesn't have ratings yet
const calculateScore = (id: number) => {
  return 5 + (id % 5) + (id % 3) * 0.5 // Random consistent score between 5.0 and 9.5
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [stations, setStations] = useState<PoliceStation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, hospRes, polRes] = await Promise.all([
          fetchDashboardStats(),
          fetchHospitals(),
          fetchPoliceStations()
        ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (hospRes.success && hospRes.data) setHospitals(hospRes.data);
        if (polRes.success && polRes.data) setStations(polRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Process data for charts
  const activeHospitals = hospitals.filter(h => h.is_active).map(h => ({
    rank: h.hospital_id,
    name: h.hospital_name,
    score: calculateScore(h.hospital_id),
    response: `${(3 + (h.hospital_id % 4)).toFixed(1)} min`,
    satisfaction: `${80 + (h.hospital_id % 15)}%`,
    beds: h.bed_capacity
  })).sort((a, b) => b.score - a.score);

  const activeStations = stations.filter(s => s.is_active).map(s => ({
    rank: s.station_id,
    name: s.station_name,
    score: calculateScore(s.station_id + 10),
    response: `${(2 + (s.station_id % 3)).toFixed(1)} min`,
    resolution: `${75 + (s.station_id % 20)}%`,
    units: 5 + (s.station_id % 15)
  })).sort((a, b) => b.score - a.score);

  const topHospitals = activeHospitals.slice(0, 3);
  const underHospitals = [...activeHospitals].sort((a, b) => a.score - b.score).slice(0, 3);
  
  const topPoliceStations = activeStations.slice(0, 3);
  const underPoliceStations = [...activeStations].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          
          {/* Stats Overview */}
          {!isLoading && stats && (
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

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <FacilityCard
                title="Top Performing Hospitals"
                subtitle="Based on efficiency score"
                type="hospital"
                variant="top"
                facilities={topHospitals}
              />
              <FacilityCard
                title="Underperforming Hospitals"
                subtitle="Lowest efficiency scores"
                type="hospital"
                variant="under"
                facilities={underHospitals}
              />
              <FacilityCard
                title="Top Performing Police Stations"
                subtitle="Based on response & resolution"
                type="police"
                variant="top"
                facilities={topPoliceStations}
              />
              <FacilityCard
                title="Underperforming Police Stations"
                subtitle="Require strategic intervention"
                type="police"
                variant="under"
                facilities={underPoliceStations}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
