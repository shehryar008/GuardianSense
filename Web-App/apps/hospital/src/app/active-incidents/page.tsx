"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { ActiveIncidentCard } from "../../../components/active-incidents/active-incident-card"
import { useAuth } from "../../../components/auth/auth-provider"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Incident = {
  incident_id: number
  user_id: string
  latitude: number
  longitude: number
  is_active: boolean
  detected_at: string
}

type Dispatch = {
  dispatch_id: number
  incident_id: number
  hospital_id: number
  dispatch_status: string
  dispatched_at: string
  incidents?: {
    latitude: number
    longitude: number
    detected_at: string
    is_active: boolean
  }
}

export default function ActiveIncidentsPage() {
  const { hospital, token } = useAuth()
  const router = useRouter()
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([])
  const [activeDispatches, setActiveDispatches] = useState<Dispatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [dispatchingId, setDispatchingId] = useState<number | null>(null)

  const fetchData = async () => {
    if (!hospital?.hospital_id || !token) return

    try {
      setIsLoading(true)
      setError("")

      // Fetch both: active incidents from DB + dispatches for this hospital
      const [incidentsRes, dispatchesRes] = await Promise.all([
        fetch(`${API_URL}/api/hospitals/incidents/active`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/hospitals/${hospital.hospital_id}/dispatches`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const incidentsData = await incidentsRes.json()
      const dispatchesData = await dispatchesRes.json()

      if (incidentsRes.status === 401 || dispatchesRes.status === 401) {
        router.push("/login")
        return
      }

      if (dispatchesData.success) {
        const active = (dispatchesData.data as Dispatch[]).filter(
          (d) => d.dispatch_status === "Pending" || d.dispatch_status === "En Route"
        )
        setActiveDispatches(active)
      }

      if (incidentsData.success) {
        // Filter out incidents that already have a dispatch from this hospital
        const dispatchedIncidentIds = new Set(
          (dispatchesData.success ? (dispatchesData.data as Dispatch[]) : []).map((d) => d.incident_id)
        )
        const undispatched = (incidentsData.data as Incident[]).filter(
          (inc) => !dispatchedIncidentIds.has(inc.incident_id)
        )
        setActiveIncidents(undispatched)
      }
    } catch {
      setError("Network error fetching data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospital?.hospital_id, token])

  const handleDispatch = async (incidentId: number) => {
    if (!hospital?.hospital_id || !token) return
    setDispatchingId(incidentId)
    setError("")

    try {
      const res = await fetch(`${API_URL}/api/hospitals/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          incident_id: incidentId,
          hospital_id: hospital.hospital_id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        // Re-fetch to update lists
        await fetchData()
      } else {
        setError(data.message || "Failed to dispatch")
      }
    } catch {
      setError("Network error dispatching ambulance")
    } finally {
      setDispatchingId(null)
    }
  }

  const handleResolve = async (dispatchId: number, currentStatus: string) => {
    try {
      setError("")
      if (currentStatus === "Pending") {
        const p1 = await fetch(`${API_URL}/api/hospitals/dispatch/${dispatchId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dispatch_status: "En Route" }),
        })
        if (p1.status === 401) { router.push("/login"); return }
        const d1 = await p1.json()
        if (!d1.success) throw new Error(d1.message || "Failed to update to En Route")
      }

      const p2 = await fetch(`${API_URL}/api/hospitals/dispatch/${dispatchId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dispatch_status: "Resolved" }),
      })
      if (p2.status === 401) { router.push("/login"); return }
      const d2 = await p2.json()
      if (!d2.success) throw new Error(d2.message || "Failed to resolve")

      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error resolving incident")
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Active Incidents" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Active Incidents</h1>
            <p className="text-gray-500 mt-1">Currently active emergency situations requiring immediate attention</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-gray-500">Loading active incidents...</div>
          ) : (
            <>
              {/* Undispatched Incidents */}
              {activeIncidents.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    Awaiting Dispatch ({activeIncidents.length})
                  </h2>
                  <div className="space-y-4">
                    {activeIncidents.map((incident) => (
                      <div
                        key={incident.incident_id}
                        className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                              <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                                <span className="text-red-500 text-xs font-bold">!</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-900 font-semibold">Incident #{incident.incident_id}</h3>
                                <span className="text-xs text-gray-400">{formatTimeAgo(incident.detected_at)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{Number(incident.latitude).toFixed(4)}, {Number(incident.longitude).toFixed(4)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium px-3 py-1 rounded-lg bg-red-50 text-red-600">
                              Unassigned
                            </span>
                            <button
                              onClick={() => handleDispatch(incident.incident_id)}
                              disabled={dispatchingId === incident.incident_id}
                              className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {dispatchingId === incident.incident_id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                  Dispatch
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Already Dispatched */}
              {activeDispatches.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-teal-500 rounded-full" />
                    Dispatched ({activeDispatches.length})
                  </h2>
                  <div className="space-y-4">
                    {activeDispatches.map((dispatch) => {
                      const incidents = dispatch.incidents
                      return (
                        <ActiveIncidentCard
                          key={String(dispatch.dispatch_id)}
                          title={`Incident #${dispatch.incident_id}`}
                          location={
                            incidents?.latitude && incidents?.longitude
                              ? `${Number(incidents.latitude).toFixed(4)}, ${Number(incidents.longitude).toFixed(4)}`
                              : "Unknown Location"
                          }
                          status={dispatch.dispatch_status as "Pending" | "En Route"}
                          onResolve={() => handleResolve(dispatch.dispatch_id, dispatch.dispatch_status)}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {activeIncidents.length === 0 && activeDispatches.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">All Clear</h3>
                  <p className="text-gray-500 mt-1">No active incidents at this time.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
