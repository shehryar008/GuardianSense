"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { StatCard } from "../../../components/dashboard/stat-card"
import { IncidentCard } from "../../../components/dashboard/incident-card"
import { CriticalAlert } from "../../../components/dashboard/critical-alert"
import { AlertTriangleIcon, ClockIcon, ActivityIcon, UsersIcon } from "../../../components/shared/icons"
import { useAuth } from "../../../components/auth/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export default function HospitalDashboard() {
  const { hospital, token } = useAuth()
  const [dispatches, setDispatches] = useState<Record<string, unknown>[]>([])
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
          setDispatches(data.data)
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

  const handleResolve = async (dispatchId: number | string, currentStatus: string) => {
    try {
      if (currentStatus === "Pending") {
        const p1 = await fetch(`${API_URL}/api/hospitals/dispatch/${dispatchId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dispatch_status: "En Route" })
        });
        if (!p1.ok) throw new Error("Failed to update status to En Route");
      }
      
      const p2 = await fetch(`${API_URL}/api/hospitals/dispatch/${dispatchId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dispatch_status: "Resolved" })
      });
      if (!p2.ok) throw new Error("Failed to update status to Resolved");
      
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error resolving incident");
    }
  };

  // Stat calculations
  const totalIncidents = dispatches.length
  const activeDispatches = dispatches.filter((d: Record<string, unknown>) => d.dispatch_status === "Pending" || d.dispatch_status === "En Route").length
  const resolvedDispatches = dispatches.filter((d: Record<string, unknown>) => d.dispatch_status === "Resolved").length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeItem="Dashboard" />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Critical Alert - Just show the latest critical one if it exists */}
          {activeDispatches > 0 && (
            <CriticalAlert message={`You have ${activeDispatches} active ${activeDispatches === 1 ? 'dispatch' : 'dispatches'} requiring attention`} />
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <StatCard
              icon={<AlertTriangleIcon className="w-6 h-6 text-red-500" />}
              iconBgColor="bg-red-100"
              value={totalIncidents.toString()}
              label="Total Dispatches"
              subtext=""
              subtextColor="text-red-500"
            />
            <StatCard
              icon={<ActivityIcon className="w-6 h-6 text-amber-500" />}
              iconBgColor="bg-amber-100"
              value={activeDispatches.toString()}
              label="Active"
              subtext="Pending / En Route"
              subtextColor="text-amber-500"
            />
            <StatCard
              icon={<ClockIcon className="w-6 h-6 text-blue-500" />}
              iconBgColor="bg-blue-100"
              value={resolvedDispatches.toString()}
              label="Resolved"
              subtext=""
              subtextColor="text-blue-500"
            />
            <StatCard
              icon={<UsersIcon className="w-6 h-6 text-teal-500" />}
              iconBgColor="bg-teal-100"
              value={hospital?.bed_capacity ? hospital.bed_capacity.toString() : "--"}
              label="Bed Capacity"
              subtext=""
              subtextColor="text-teal-500"
            />
          </div>

          {/* Live Incident Feed */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Hospital Dispatches Feed</h2>
              <span className="flex items-center gap-1.5 text-sm text-teal-500">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                Live Updates
              </span>
            </div>

            {isLoading ? (
              <div className="text-gray-500">Loading dispatches...</div>
            ) : dispatches.length === 0 ? (
              <div className="text-gray-500">No dispatches found for this hospital.</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {dispatches.map((dispatch) => {
                  const incidents = dispatch.incidents as Record<string, unknown> | undefined
                  return (
                    <IncidentCard
                      key={String(dispatch.dispatch_id)}
                      title={`Incident #${dispatch.incident_id}`}
                      description={`Status: ${dispatch.dispatch_status}`}
                      location={incidents?.latitude && incidents?.longitude ? `${Number(incidents.latitude).toFixed(4)}, ${Number(incidents.longitude).toFixed(4)}` : "Unknown Location"}
                      time={dispatch.dispatched_at ? new Date(String(dispatch.dispatched_at)).toLocaleString() : "Unknown"}
                      onResolve={dispatch.dispatch_status === "Resolved" ? undefined : () => handleResolve(String(dispatch.dispatch_id), String(dispatch.dispatch_status))}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
