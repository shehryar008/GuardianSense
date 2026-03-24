"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { FilterIcon, DownloadIcon } from "../../../../components/shared/icons"
import { fetchActivityLog, ActivityEntry } from "../../../../src/lib/api"

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const res = await fetchActivityLog(50)
        if (res.success && res.data) {
          setActivities(res.data)
        } else {
          setError(res.message || "Failed to fetch activity log")
        }
      } catch (err) {
        setError("Network error")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Incident":
        return "bg-red-50 text-red-600 border-red-200"
      case "Police":
        return "bg-blue-50 text-blue-600 border-blue-200"
      case "Medical":
        return "bg-green-50 text-green-600 border-green-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Activity Log</h1>
              <p className="text-gray-500 text-sm">Real-time track of all system events and dispatches</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <FilterIcon className="w-4 h-4" />
                Filter Activity
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">
                <DownloadIcon className="w-4 h-4" />
                Export Logs
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading && activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Loading activity log...</div>
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors">
                    <div className="mt-1">
                      <div className={`w-2 h-2 rounded-full ${activity.category === 'Incident' ? 'bg-red-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 text-xs font-medium border rounded-md ${getCategoryColor(activity.category)}`}>
                          {activity.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          by <span className="font-medium text-gray-700">{activity.actor}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No recent activities found.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
