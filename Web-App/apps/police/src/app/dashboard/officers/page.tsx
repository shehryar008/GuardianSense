import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { OfficerCard } from "../../../../components/dashboard/officer-card"

const officers = [
  {
    name: "Officer Martinez",
    badge: "Badge",
    status: "On Duty" as const,
    unit: "UNIT-301",
    shift: "Day Shift",
    location: "Downtown",
    phone: "555-0101",
    initials: "OM",
    color: "#6366f1",
  },
  {
    name: "Officer Chen",
    badge: "Badge",
    status: "On Duty" as const,
    unit: "UNIT-301",
    shift: "Day Shift",
    location: "Downtown",
    phone: "555-0102",
    initials: "OC",
    color: "#22c55e",
  },
  {
    name: "Sgt. Williams",
    badge: "Badge",
    status: "On Duty" as const,
    unit: "UNIT-215",
    shift: "Day Shift",
    location: "West District",
    phone: "555-0201",
    initials: "SW",
    color: "#06b6d4",
  },
  {
    name: "Officer Davis",
    badge: "Badge",
    status: "On Duty" as const,
    unit: "UNIT-215",
    shift: "Day Shift",
    location: "West District",
    phone: "555-0103",
    initials: "OD",
    color: "#f97316",
  },
  {
    name: "Officer Johnson",
    badge: "Badge",
    status: "Available" as const,
    unit: "UNIT-442",
    shift: "Day Shift",
    location: "Central",
    phone: "555-0104",
    initials: "OJ",
    color: "#eab308",
  },
  {
    name: "Officer Smith",
    badge: "Badge",
    status: "Available" as const,
    unit: "UNIT-442",
    shift: "Day Shift",
    location: "Central",
    phone: "555-0105",
    initials: "OS",
    color: "#22c55e",
  },
  {
    name: "Det. Brown",
    badge: "Badge",
    status: "On Duty" as const,
    unit: "UNIT-158",
    shift: "Day Shift",
    location: "East Side",
    phone: "555-0301",
    initials: "DB",
    color: "#a855f7",
  },
  {
    name: "Officer Wilson",
    badge: "Badge",
    status: "On Duty" as const,
    unit: "UNIT-158",
    shift: "Day Shift",
    location: "East Side",
    phone: "555-0106",
    initials: "OW",
    color: "#6366f1",
  },
  {
    name: "Officer Taylor",
    badge: "Badge",
    status: "Available" as const,
    unit: "UNIT-529",
    shift: "Day Shift",
    location: "North",
    phone: "555-0107",
    initials: "OT",
    color: "#f97316",
  },
  {
    name: "Officer Garcia",
    badge: "Badge",
    status: "Available" as const,
    unit: "UNIT-529",
    shift: "Day Shift",
    location: "North",
    phone: "555-0108",
    initials: "OG",
    color: "#22c55e",
  },
  {
    name: "Lt. Anderson",
    badge: "Badge",
    status: "On Duty" as const,
    unit: "UNIT-673",
    shift: "Day Shift",
    location: "Highway",
    phone: "555-0401",
    initials: "LA",
    color: "#06b6d4",
  },
  {
    name: "Officer Lee",
    badge: "Badge",
    status: "On Duty" as const,
    unit: "UNIT-673",
    shift: "Day Shift",
    location: "Highway",
    phone: "555-0109",
    initials: "OL",
    color: "#ec4899",
  },
]

export default function OfficersPage() {
  const onDutyCount = officers.filter((o) => o.status === "On Duty").length
  const availableCount = officers.filter((o) => o.status === "Available").length

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Officers on Duty</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                {onDutyCount} On Duty
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                {availableCount} Available
              </span>
            </div>
          </div>

          {/* Officers Grid */}
          <div className="grid grid-cols-3 gap-4">
            {officers.map((officer, index) => (
              <OfficerCard key={index} {...officer} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
