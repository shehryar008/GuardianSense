import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { IncidentRow } from "../../../../components/dashboard/incident-row"

const incidents = [
  {
    priority: "CRITICAL" as const,
    title: "Armed Robbery in Progress",
    location: "E 27TH ST, 1st-10th - NY",
    timeAgo: "3 min ago",
    unit: "UNIT-301",
    status: "Active" as const,
  },
  {
    priority: "CRITICAL" as const,
    title: "Officer Down - Backup Needed",
    location: "Downtown Plaza",
    timeAgo: "5 min ago",
    unit: "UNIT-215",
    status: "Active" as const,
  },
  {
    priority: "HIGH" as const,
    title: "Domestic Disturbance",
    location: "W Main Avenue, Apt 4B",
    timeAgo: "8 min ago",
    unit: "UNIT-442",
    status: "En Route" as const,
  },
  {
    priority: "HIGH" as const,
    title: "Hit and Run Accident",
    location: "Highway 101 North",
    timeAgo: "12 min ago",
    unit: "UNIT-158",
    status: "Investigating" as const,
  },
  {
    priority: "MEDIUM" as const,
    title: "Suspicious Vehicle",
    location: "W 6TH ST, 3rd-20th",
    timeAgo: "15 min ago",
    unit: "UNIT-529",
    status: "Investigating" as const,
  },
  {
    priority: "MEDIUM" as const,
    title: "Noise Complaint",
    location: "Riverside Apartments",
    timeAgo: "18 min ago",
    unit: "UNIT-673",
    status: "En Route" as const,
  },
  {
    priority: "LOW" as const,
    title: "Lost Child Report",
    location: "Central Park",
    timeAgo: "22 min ago",
    unit: "UNIT-401",
    status: "Resolved" as const,
  },
  {
    priority: "LOW" as const,
    title: "Parking Violation",
    location: "Main Street",
    timeAgo: "25 min ago",
    unit: "UNIT-502",
    status: "Active" as const,
  },
]

export default function ActiveIncidentsPage() {
  const criticalCount = incidents.filter((i) => i.priority === "CRITICAL").length
  const highCount = incidents.filter((i) => i.priority === "HIGH").length
  const mediumCount = incidents.filter((i) => i.priority === "MEDIUM").length
  const lowCount = incidents.filter((i) => i.priority === "LOW").length

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">All Active Incidents</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                {criticalCount} Critical
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">
                {highCount} High
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                {mediumCount} Medium
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                {lowCount} Low
              </span>
            </div>
          </div>

          {/* Incidents List */}
          <div className="space-y-3">
            {incidents.map((incident, index) => (
              <IncidentRow key={index} {...incident} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
