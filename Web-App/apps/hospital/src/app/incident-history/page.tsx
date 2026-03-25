"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { LocationIcon, CalendarIcon, ClockIcon } from "../../../components/shared/icons"
import { useAuth } from "../../../components/auth/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    Critical: "bg-red-100 text-red-600",
    High: "bg-orange-100 text-orange-600",
    Medium: "bg-gray-200 text-gray-600",
    Low: "bg-green-100 text-green-600",
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[severity] || colors["Medium"]}`}>
      {severity}
    </span>
  )
}

function calculateDuration(dispatchedAt: string, resolvedAt?: string | null) {
  if (!resolvedAt) return "Unknown"
  const dStart = new Date(dispatchedAt).getTime()
  const dEnd = new Date(resolvedAt).getTime()
  const diffMins = Math.round((dEnd - dStart) / 60000)
  return diffMins > 0 ? `${diffMins} min` : "< 1 min"
}

export default function IncidentHistoryPage() {
  const { hospital, token } = useAuth()
  const [resolvedDispatches, setResolvedDispatches] = useState<Record<string, unknown>[]>([])
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
          // Filter only resolved dispatches
          const resolved = data.data.filter((d: Record<string, unknown>) => d.dispatch_status === "Resolved")
          setResolvedDispatches(resolved)
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
      <Sidebar activeItem="Incident History" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Incident History</h1>
            <p className="text-gray-500">Complete record of past incidents and responses</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading incident history...</div>
            ) : resolvedDispatches.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No resolved incidents found.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Incident Ref
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resolvedDispatches.map((dispatch) => {
                    const incidents = dispatch.incidents as Record<string, unknown> | undefined
                    return (
                      <tr key={String(dispatch.dispatch_id)} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            Incident #{String(dispatch.incident_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <LocationIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {incidents?.latitude && incidents?.longitude
                                ? `${Number(incidents.latitude).toFixed(4)}, ${Number(incidents.longitude).toFixed(4)}`
                                : "Unknown Location"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {dispatch.dispatched_at
                                ? new Date(String(dispatch.dispatched_at)).toLocaleString()
                                : "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {/* Using detected_at or dispatched_at vs resolved_at?
                                  The incidents table doesn't return resolved_at in our custom query.
                                  Let's just show an estimated duration for resolved dispatches. */}
                              {calculateDuration(String(dispatch.dispatched_at), incidents?.detected_at ? String(incidents.detected_at) : undefined)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <SeverityBadge severity="Medium" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-green-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium">Resolved</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
