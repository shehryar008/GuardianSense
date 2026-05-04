"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { IncidentRow } from "../../../../components/dashboard/incident-row"
import { useAuth } from "../../../../components/auth/auth-provider"
import { formatDistanceToNow } from "date-fns"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Incident {
  incident_id: number
  latitude: number
  longitude: number
  is_active: boolean
  detected_at: string
}

export default function ActiveIncidentsPage() {
  const { station, token } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchIncidents = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/police/incidents/active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setIncidents(data.data || [])
    } catch (err) {
      console.error("Failed to fetch active incidents", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
    const interval = setInterval(fetchIncidents, 10000)
    return () => clearInterval(interval)
  }, [token])

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
        alert("Unit successfully dispatched!")
      } else {
        alert(data.message || "Failed to dispatch")
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Active Network Incidents</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                {incidents.length} Total Active
              </span>
            </div>
          </div>

          {/* Incidents List */}
          <div className="space-y-3">
            {isLoading && incidents.length === 0 && <p className="text-gray-500">Loading incidents...</p>}
            {!isLoading && incidents.length === 0 && <p className="text-gray-500">No active incidents found.</p>}
            {incidents.map((incident) => (
              <IncidentRow 
                key={incident.incident_id}
                title={`Incident #${incident.incident_id}`}
                location={`${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}
                timeAgo={formatDistanceToNow(new Date(incident.detected_at), { addSuffix: true })}
                onAction={() => handleDispatch(incident.incident_id)}
                actionLabel="Dispatch Unit"
                isActionLoading={actionLoading === incident.incident_id}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
