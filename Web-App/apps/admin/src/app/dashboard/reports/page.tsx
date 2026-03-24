"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { fetchReports, ReportData } from "../../../../src/lib/api"
import { DownloadIcon } from "../../../../components/shared/icons"

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setIsLoading(true)
      const res = await fetchReports()
      if (res.success && res.data) {
        setReport(res.data)
      } else {
        setError(res.message || "Failed to fetch reports")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
              <p className="text-gray-500 text-sm">System-wide incident data and statistics</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">
              <DownloadIcon className="w-4 h-4" />
              Export Full Report
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : report && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Total Incidents</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{report.total_incidents}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Active Incidents</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{report.active_incidents}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Resolved Incidents</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{report.resolved_incidents}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Hospital Dispatches</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{report.hospital_dispatches}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Police Dispatches</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{report.police_dispatches}</p>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Detected</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolution Time</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dispatches</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.incidents.map((incident) => {
                        // Calculate resolution time if resolved
                        let resTime = "N/A"
                        if (incident.resolved_at && incident.detected_at) {
                          const diffMs = new Date(incident.resolved_at).getTime() - new Date(incident.detected_at).getTime()
                          const diffMins = Math.round(diffMs / 60000)
                          resTime = `${diffMins} min`
                        }

                        return (
                          <tr key={incident.incident_id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">INC-{incident.incident_id}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {new Date(incident.detected_at).toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">{resTime}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              <div className="flex flex-col gap-1">
                                {incident.incident_dispatch?.map((d: any) => (
                                  <span key={d.dispatch_id} className="text-xs">
                                    • {d.responder_type} ({d.dispatch_status})
                                  </span>
                                ))}
                                {!incident.incident_dispatch || incident.incident_dispatch.length === 0 ? "None" : ""}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  incident.is_active
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }`}
                              >
                                {incident.is_active ? "Active" : "Resolved"}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      {report.incidents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                            No incidents found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
