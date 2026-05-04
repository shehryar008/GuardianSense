"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { useAuth } from "../../../../components/auth/auth-provider"
import { format } from "date-fns"
import {
  FileIcon,
  CheckCircleIcon,
  ClockIcon,
  SearchIcon,
  CalendarIcon,
  FilterIcon,
  DownloadIcon,
} from "../../../../components/shared/icons"

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

export default function CaseHistoryPage() {
  const { station, token } = useAuth()
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDispatches = async () => {
    if (!token || !station) return
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/police/${station.station_id}/dispatches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setDispatches(data.data || [])
    } catch (err) {
      console.error("Failed to fetch dispatches", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDispatches()
  }, [station, token])

  const stats = [
    { icon: FileIcon, value: dispatches.length.toString(), label: "Total Cases", bgColor: "bg-gray-50" },
    { icon: CheckCircleIcon, value: dispatches.filter(d => d.dispatch_status === "Resolved").length.toString(), label: "Resolved Cases", bgColor: "bg-green-50", iconColor: "text-green-600" },
    { icon: ClockIcon, value: dispatches.filter(d => d.dispatch_status === "En Route").length.toString(), label: "En Route", bgColor: "bg-yellow-50", iconColor: "text-yellow-600" },
    { icon: ClockIcon, value: dispatches.filter(d => d.dispatch_status === "Pending").length.toString(), label: "Pending", bgColor: "bg-blue-50", iconColor: "text-blue-600" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700"
      case "En Route":
        return "bg-yellow-100 text-yellow-700"
      case "Pending":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${stat.bgColor} rounded-xl border border-gray-200 p-4 flex items-center gap-4`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor || "text-gray-600"}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by case ID, title, officer, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <CalendarIcon className="w-4 h-4" />
                Date Range
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <FilterIcon className="w-4 h-4" />
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <DownloadIcon className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispatch ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispatched At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Loading dispatches...
                    </td>
                  </tr>
                )}
                {!isLoading && dispatches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No dispatches found.
                    </td>
                  </tr>
                )}
                {dispatches.map((disp) => (
                  <tr key={disp.dispatch_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-blue-600">DISP-{disp.dispatch_id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">INC-{disp.incident_id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">
                        {format(new Date(disp.dispatched_at), "MMM d, yyyy HH:mm")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">
                        {disp.incidents?.latitude?.toFixed(4)}, {disp.incidents?.longitude?.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                          disp.dispatch_status,
                        )}`}
                      >
                        {disp.dispatch_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
