"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { ActiveIncidentCard } from "../../../components/active-incidents/active-incident-card"
import { useAuth } from "../../../components/auth/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export default function ActiveIncidentsPage() {
  const { hospital, token } = useAuth()
  const [activeDispatches, setActiveDispatches] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!hospital?.hospital_id || !token) return

    const fetchDispatches = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`${API_URL}/api/hospitals/${hospital.hospital_id}/dispatches`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        if (data.success) {
          // Filter only active dispatches (Pending, En Route)
          const active = data.data.filter(
            (d: Record<string, unknown>) => d.dispatch_status === "Pending" || d.dispatch_status === "En Route"
          )
          setActiveDispatches(active)
        } else {
          setError(data.message || "Failed to fetch dispatches")
        }
      } catch {
        setError("Network error fetching dispatches")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDispatches()
  }, [hospital?.hospital_id, token])

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

          {/* Incident cards */}
          {isLoading ? (
            <div className="text-gray-500">Loading active incidents...</div>
          ) : activeDispatches.length === 0 ? (
            <div className="text-gray-500">No active incidents found.</div>
          ) : (
            <div className="space-y-4">
              {activeDispatches.map((dispatch) => {
                const incidents = dispatch.incidents as Record<string, unknown> | undefined
                return (
                  <ActiveIncidentCard
                    key={String(dispatch.dispatch_id)}
                    title={`Incident #${dispatch.incident_id}`}
                    priority={dispatch.dispatch_status === "Pending" ? "critical" : "medium"}
                    location={
                      incidents?.latitude && incidents?.longitude
                        ? `${Number(incidents.latitude).toFixed(4)}, ${Number(incidents.longitude).toFixed(4)}`
                        : "Unknown Location"
                    }
                    responders="Hospital Response"
                    eta="Calculating..."
                    casualties="-"
                    status={dispatch.dispatch_status as "In Progress" | "Dispatched" | "En Route"}
                  />
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
