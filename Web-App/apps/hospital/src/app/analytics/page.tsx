import type React from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"

function AnalyticsStatCard({
  icon,
  iconBgColor,
  value,
  label,
  change,
  changeColor,
}: {
  icon: React.ReactNode
  iconBgColor: string
  value: string
  label: string
  change: string
  changeColor: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center`}>{icon}</div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xs ${changeColor} mt-1`}>{change}</p>
    </div>
  )
}

function IncidentBar({
  label,
  count,
  percentage,
  color,
}: {
  label: string
  count: number
  percentage: string
  color: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: percentage }} />
      </div>
    </div>
  )
}

function ResponseTimeBar({
  timeRange,
  duration,
  percentage,
  color,
}: {
  timeRange: string
  duration: string
  percentage: string
  color: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{timeRange}</span>
        <span className="text-sm text-gray-500">{duration}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: percentage }} />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Analytics" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-gray-500">Performance metrics and operational insights</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <AnalyticsStatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              iconBgColor="bg-teal-500"
              value="247"
              label="Total Incidents (30d)"
              change="+12% from last month"
              changeColor="text-green-500"
            />
            <AnalyticsStatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              iconBgColor="bg-teal-400"
              value="3.8 min"
              label="Avg Response Time"
              change="-8% faster"
              changeColor="text-green-500"
            />
            <AnalyticsStatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              iconBgColor="bg-yellow-400"
              value="96%"
              label="Success Rate"
              change="+2% improvement"
              changeColor="text-green-500"
            />
            <AnalyticsStatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              iconBgColor="bg-orange-400"
              value="1,847"
              label="Lives Saved"
              change="+156 this month"
              changeColor="text-green-500"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incident Types Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Types Distribution</h3>
              <div className="space-y-4">
                <IncidentBar label="Vehicle Accidents" count={98} percentage="100%" color="bg-red-500" />
                <IncidentBar label="Cardiac Emergencies" count={74} percentage="75%" color="bg-orange-400" />
                <IncidentBar label="Fire Hazards" count={49} percentage="50%" color="bg-yellow-400" />
                <IncidentBar label="Other" count={26} percentage="26%" color="bg-gray-400" />
              </div>
            </div>

            {/* Response Time by Hour */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time by Hour</h3>
              <div className="space-y-4">
                <ResponseTimeBar timeRange="00:00 - 06:00" duration="2.8 min" percentage="56%" color="bg-teal-500" />
                <ResponseTimeBar timeRange="06:00 - 12:00" duration="4.2 min" percentage="84%" color="bg-teal-500" />
                <ResponseTimeBar timeRange="12:00 - 18:00" duration="5.1 min" percentage="100%" color="bg-teal-500" />
                <ResponseTimeBar timeRange="18:00 - 00:00" duration="3.9 min" percentage="78%" color="bg-red-500" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
