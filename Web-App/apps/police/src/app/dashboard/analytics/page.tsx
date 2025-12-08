import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { AnalyticsCard } from "../../../../components/dashboard/analytics-card"
import { AlertTriangleIcon, ClockIcon, UsersIcon, CheckCircleIcon, BarChartIcon } from "../../../../components/shared/icons"

const incidentsByType = [
  { type: "Armed Robbery", count: 8, percentage: 17, color: "#ef4444" },
  { type: "Domestic Disturbance", count: 12, percentage: 26, color: "#f97316" },
  { type: "Traffic Violation", count: 15, percentage: 32, color: "#eab308" },
  { type: "Suspicious Activity", count: 7, percentage: 15, color: "#3b82f6" },
  { type: "Other", count: 5, percentage: 10, color: "#22c55e" },
]

const responseTimeByHour = [
  { hour: "00:00", time: 3.2 },
  { hour: "02:00", time: 2.8 },
  { hour: "04:00", time: 2.5 },
  { hour: "06:00", time: 3.5 },
  { hour: "08:00", time: 4.8 },
  { hour: "10:00", time: 5.2 },
  { hour: "12:00", time: 6.1 },
  { hour: "14:00", time: 5.5 },
  { hour: "16:00", time: 6.8 },
  { hour: "18:00", time: 7.2 },
  { hour: "20:00", time: 5.9 },
  { hour: "22:00", time: 4.5 },
]

const weeklyTrend = [
  { day: "Mon", count: 42 },
  { day: "Tue", count: 38 },
  { day: "Wed", count: 51 },
  { day: "Thu", count: 45 },
  { day: "Fri", count: 48 },
  { day: "Sat", count: 35 },
  { day: "Sun", count: 39 },
]

const maxWeeklyCount = Math.max(...weeklyTrend.map((d) => d.count))
const maxResponseTime = Math.max(...responseTimeByHour.map((d) => d.time))

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Key Performance Metrics</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <AnalyticsCard
              icon={<AlertTriangleIcon className="w-5 h-5" />}
              value="47"
              label="Total Incidents (24h)"
              trend="+12%"
              trendUp={true}
              iconBgColor="#fef2f2"
              iconColor="#ef4444"
            />
            <AnalyticsCard
              icon={<ClockIcon className="w-5 h-5" />}
              value="4.2 min"
              label="Avg Response Time"
              trend="-6%"
              trendUp={false}
              iconBgColor="#eff6ff"
              iconColor="#3b82f6"
            />
            <AnalyticsCard
              icon={<UsersIcon className="w-5 h-5" />}
              value="156"
              label="Officers Active"
              trend="+5%"
              trendUp={true}
              iconBgColor="#f0fdf4"
              iconColor="#22c55e"
            />
            <AnalyticsCard
              icon={<CheckCircleIcon className="w-5 h-5" />}
              value="42"
              label="Resolved Cases"
              trend="+15%"
              trendUp={true}
              iconBgColor="#f0fdf4"
              iconColor="#22c55e"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Incidents by Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChartIcon className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Incidents by Type (24h)</h2>
              </div>
              <div className="space-y-3">
                {incidentsByType.map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.type}</span>
                      <span className="text-sm text-gray-500">
                        {item.count} <span className="text-gray-400">({item.percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage * 3}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time by Hour */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Response Time by Hour</h2>
              </div>
              <div className="space-y-2">
                {responseTimeByHour.map((item) => (
                  <div key={item.hour} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12">{item.hour}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded"
                        style={{
                          width: `${(item.time / maxResponseTime) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-12">
                      {item.time}
                      <br />
                      min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Weekly Trend Analysis</h2>
            <div className="flex items-end justify-between gap-4 h-48">
              {weeklyTrend.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-blue-500 rounded-t-lg transition-all"
                      style={{
                        height: `${(item.count / maxWeeklyCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 mt-2">{item.day}</span>
                  <span className="text-sm font-medium text-gray-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
