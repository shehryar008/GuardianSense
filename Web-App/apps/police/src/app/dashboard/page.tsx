"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { StatCard } from "../../../components/dashboard/stat-card"
import { IncidentCard } from "../../../components/dashboard/incident-card"
import { AlertTriangleIcon, ActivityIcon, FileIcon } from "../../../components/shared/icons"
import { useAuth } from "../../../components/auth/auth-provider"
import { formatDistanceToNow } from "date-fns"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Incident {
  incident_id: number
  latitude: number
  longitude: number
  is_active: boolean
  detected_at: string
}

interface Dispatch {
  dispatch_id: number
  incident_id: number
  dispatch_status: "Pending" | "En Route" | "Resolved"
  dispatched_at: string
  incidents: Incident
}

export default function PoliceDashboard() {
  const { station, token } = useAuth()
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([])
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchData = async () => {
    if (!token || !station) return
    try {
      // Fetch active incidents
      const incRes = await fetch(`${API_URL}/api/police/incidents/active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const incData = await incRes.json()
      if (incData.success) setActiveIncidents(incData.data || [])

      // Fetch dispatches
      const dispRes = await fetch(`${API_URL}/api/police/${station.station_id}/dispatches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const dispData = await dispRes.json()
      if (dispData.success) setDispatches(dispData.data || [])
    } catch (err) {
      console.error("Failed to fetch data", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [station, token])

  const handleDispatch = async (incidentId: number) => {
    if (!token || !station) return
    setActionLoading(incidentId)
    try {
      const res = await fetch(`${API_URL}/api/police/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          incident_id: incidentId,
          station_id: station.station_id,
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
      } else {
        alert(data.message || "Failed to dispatch")
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusUpdate = async (dispatchId: number, currentStatus: string) => {
    if (!token) return
    setActionLoading(dispatchId)
    
    let nextStatus = "En Route"
    if (currentStatus === "En Route") nextStatus = "Resolved"
    
    try {
      const res = await fetch(`${API_URL}/api/police/dispatch/${dispatchId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dispatch_status: nextStatus })
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
      } else {
        alert(data.message || "Failed to update status")
      }
    } finally {
      setActionLoading(null)
    }
  }

  // Calculate active dispatches (not resolved)
  const activeDispatches = dispatches.filter(d => d.dispatch_status !== "Resolved")
  
  // Exclude incidents we have already dispatched to
  const ourDispatchedIncidentIds = new Set(dispatches.map(d => d.incident_id))
  const unhandledIncidents = activeIncidents.filter(inc => !ourDispatchedIncidentIds.has(inc.incident_id))

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-2">
            <StatCard
              icon={<AlertTriangleIcon className="w-5 h-5 text-red-500" />}
              iconBgColor="bg-red-100"
              value={activeIncidents.length.toString()}
              label="Active Network Incidents"
              subtextColor="text-gray-500"
            />
            <StatCard
              icon={<ActivityIcon className="w-5 h-5 text-blue-500" />}
              iconBgColor="bg-blue-100"
              value={activeDispatches.length.toString()}
              label="Our Active Dispatches"
              subtextColor="text-gray-500"
            />
            <StatCard
              icon={<FileIcon className="w-5 h-5 text-green-500" />}
              iconBgColor="bg-green-100"
              value={dispatches.length.toString()}
              label="Total Cases Handled"
              subtextColor="text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Left Column: Unhandled Incidents */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">New Incidents</h2>
                <span className="flex items-center gap-1 text-sm text-red-500">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Action Required
                </span>
              </div>
              <div className="space-y-4">
                {isLoading && unhandledIncidents.length === 0 && <p className="text-gray-500">Loading...</p>}
                {!isLoading && unhandledIncidents.length === 0 && <p className="text-gray-500">No new incidents.</p>}
                {unhandledIncidents.map(inc => (
                  <IncidentCard
                    key={`inc-${inc.incident_id}`}
                    title={`Incident #${inc.incident_id}`}
                    description="AI detected a potential accident at this location."
                    location={`${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`}
                    time={formatDistanceToNow(new Date(inc.detected_at), { addSuffix: true })}
                    onAction={() => handleDispatch(inc.incident_id)}
                    actionLabel="Dispatch Unit"
                    isActionLoading={actionLoading === inc.incident_id}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Our Dispatches */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Our Dispatches</h2>
              </div>
              <div className="space-y-4">
                {isLoading && activeDispatches.length === 0 && <p className="text-gray-500">Loading...</p>}
                {!isLoading && activeDispatches.length === 0 && <p className="text-gray-500">No active dispatches.</p>}
                {activeDispatches.map(disp => (
                  <IncidentCard
                    key={`disp-${disp.dispatch_id}`}
                    title={`Incident #${disp.incident_id} - ${disp.dispatch_status}`}
                    description="Police unit is responding to this incident."
                    location={`${disp.incidents?.latitude?.toFixed(4)}, ${disp.incidents?.longitude?.toFixed(4)}`}
                    time={formatDistanceToNow(new Date(disp.dispatched_at), { addSuffix: true })}
                    onAction={() => handleStatusUpdate(disp.dispatch_id, disp.dispatch_status)}
                    actionLabel={disp.dispatch_status === "Pending" ? "Mark En Route" : "Resolve"}
                    isActionLoading={actionLoading === disp.dispatch_id}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
