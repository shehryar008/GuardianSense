"use client"

import { useState } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const tabs = ["Overview", "Hospital Metrics", "Police Metrics", "Comparative Analysis"]

// Overview tab data
const responseTimeTrendsData = [
  { day: "Mon", ambulance: 4.2, average: 4.5, police: 4.8 },
  { day: "Tue", ambulance: 3.8, average: 4.2, police: 4.5 },
  { day: "Wed", ambulance: 4.5, average: 4.8, police: 5.2 },
  { day: "Thu", ambulance: 4.0, average: 4.3, police: 4.6 },
  { day: "Fri", ambulance: 3.5, average: 4.0, police: 4.2 },
  { day: "Sat", ambulance: 5.5, average: 5.8, police: 6.2 },
  { day: "Sun", ambulance: 5.0, average: 5.2, police: 5.8 },
]

const incidentDistributionData = [
  { name: "Medical Emergency", value: 37, color: "#EF4444" },
  { name: "Theft/Burglary", value: 22, color: "#8B5CF6" },
  { name: "Traffic Incidents", value: 17, color: "#3B82F6" },
  { name: "Domestic Issues", value: 13, color: "#22C55E" },
  { name: "Other", value: 11, color: "#F59E0B" },
]

const hospitalCapacityData = [
  { time: "00:00", emergency: 120, general: 80, icu: 30 },
  { time: "04:00", emergency: 100, general: 70, icu: 25 },
  { time: "08:00", emergency: 150, general: 100, icu: 35 },
  { time: "12:00", emergency: 200, general: 130, icu: 45 },
  { time: "16:00", emergency: 220, general: 140, icu: 50 },
  { time: "20:00", emergency: 240, general: 150, icu: 55 },
  { time: "24:00", emergency: 230, general: 145, icu: 52 },
]

// Hospital Metrics data
const patientAdmissionsData = [
  { department: "Emergency", value: 156 },
  { department: "ICU", value: 45 },
  { department: "Surgery", value: 78 },
  { department: "Cardiology", value: 42 },
  { department: "Pediatrics", value: 58 },
]

const ambulanceResponseData = [
  { day: "Mon", time: 3.8 },
  { day: "Tue", time: 3.2 },
  { day: "Wed", time: 3.5 },
  { day: "Thu", time: 4.0 },
  { day: "Fri", time: 4.5 },
  { day: "Sat", time: 5.2 },
  { day: "Sun", time: 4.8 },
]

// Police Metrics data
const incidentPriorityData = [
  { priority: "Critical", value: 32 },
  { priority: "High", value: 78 },
  { priority: "Medium", value: 156 },
  { priority: "Low", value: 245 },
]

const policeResponseData = [
  { day: "Mon", time: 4.2 },
  { day: "Tue", time: 3.8 },
  { day: "Wed", time: 4.5 },
  { day: "Thu", time: 4.8 },
  { day: "Fri", time: 5.2 },
  { day: "Sat", time: 5.8 },
  { day: "Sun", time: 5.0 },
]

// Comparative Analysis data
const monthlyIncidentsData = [
  { month: "Jan", hospital: 350, police: 420 },
  { month: "Feb", hospital: 380, police: 390 },
  { month: "Mar", hospital: 420, police: 480 },
  { month: "Apr", hospital: 450, police: 440 },
  { month: "May", hospital: 520, police: 480 },
  { month: "Jun", hospital: 480, police: 500 },
]

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("Overview")

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500">Comprehensive data visualization and comparative analysis</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "Overview" && <OverviewTab />}
          {activeTab === "Hospital Metrics" && <HospitalMetricsTab />}
          {activeTab === "Police Metrics" && <PoliceMetricsTab />}
          {activeTab === "Comparative Analysis" && <ComparativeAnalysisTab />}
        </main>
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Top Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Response Time Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Response Time Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={responseTimeTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                domain={[0, 8]}
                label={{ value: "Minutes", angle: -90, position: "insideLeft", fontSize: 12 }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="ambulance"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", r: 4 }}
                name="Ambulance"
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#3B82F6", r: 4 }}
                name="Average"
              />
              <Line
                type="monotone"
                dataKey="police"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4 }}
                name="Police"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-xs text-red-500">Ambulance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500 border-dashed"></div>
              <span className="text-xs text-blue-500">Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span className="text-xs text-blue-500">Police</span>
            </div>
          </div>
        </div>

        {/* Incident Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Incident Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={incidentDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={{ stroke: "#9CA3AF" }}
              >
                {incidentDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hospital Capacity Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Hospital Capacity Over 24 Hours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={hospitalCapacityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
              domain={[0, 280]}
              label={{ value: "Beds Occupied", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <Tooltip />
            <Area type="monotone" dataKey="icu" stackId="1" stroke="#EF4444" fill="#FCA5A5" name="ICU" />
            <Area type="monotone" dataKey="general" stackId="1" stroke="#F59E0B" fill="#FCD34D" name="General" />
            <Area type="monotone" dataKey="emergency" stackId="1" stroke="#3B82F6" fill="#93C5FD" name="Emergency" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-xs text-gray-600">Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-xs text-gray-600">General</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-xs text-gray-600">ICU</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HospitalMetricsTab() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Patient Admissions by Department */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Patient Admissions by Department</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={patientAdmissionsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="department" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" domain={[0, 160]} />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ambulance Response Times */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Ambulance Response Times</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ambulanceResponseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" domain={[0, 8]} />
            <Tooltip />
            <Line type="monotone" dataKey="time" stroke="#EC4899" strokeWidth={2} dot={{ fill: "#EC4899", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-pink-500"></div>
            <span className="text-xs text-pink-500">ambulance</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PoliceMetricsTab() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Incident Types by Priority */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Incident Types by Priority</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={incidentPriorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="priority" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" domain={[0, 260]} />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Police Response Times */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Police Response Times</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={policeResponseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" domain={[0, 8]} />
            <Tooltip />
            <Line type="monotone" dataKey="time" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-xs text-blue-500">police</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComparativeAnalysisTab() {
  return (
    <div className="space-y-6">
      {/* Monthly Incidents Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Incidents: Hospital vs Police</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyIncidentsData} barGap={0}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" domain={[0, 600]} />
            <Tooltip />
            <Bar dataKey="hospital" fill="#EF4444" radius={[4, 4, 0, 0]} name="Hospital Incidents" />
            <Bar dataKey="police" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Police Incidents" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-500"></div>
            <span className="text-xs text-gray-600">Hospital Incidents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
            <span className="text-xs text-gray-600">Police Incidents</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Total Hospital Cases</p>
          <p className="text-3xl font-bold text-gray-900">2,745</p>
          <p className="text-sm text-green-500 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Total Police Cases</p>
          <p className="text-3xl font-bold text-gray-900">2,680</p>
          <p className="text-sm text-green-500 mt-2">↑ 8% from last month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Combined Response Rate</p>
          <p className="text-3xl font-bold text-gray-900">94.2%</p>
          <p className="text-sm text-green-500 mt-2">↑ 2.1% from last month</p>
        </div>
      </div>
    </div>
  )
}
