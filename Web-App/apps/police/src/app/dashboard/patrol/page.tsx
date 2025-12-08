import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { PatrolCard } from "../../../../components/dashboard/patrol-card"

const patrolUnits = [
  {
    unitId: "UNIT-301",
    status: "On Call" as const,
    officers: "Officer Martinez, Officer Chen",
    location: "Downtown Precinct - Code 3",
    eta: "4 min",
  },
  {
    unitId: "UNIT-215",
    status: "On Call" as const,
    officers: "Sgt. Williams, Officer Davis",
    location: "West District Station",
    eta: "7 min",
  },
  {
    unitId: "UNIT-442",
    status: "Available" as const,
    officers: "Officer Johnson, Officer Smith",
    location: "Central Station",
    readyToDeploy: true,
  },
  {
    unitId: "UNIT-158",
    status: "On Call" as const,
    officers: "Det. Brown, Officer Wilson",
    location: "East Side Crime Scene",
    eta: "10 min",
  },
  {
    unitId: "UNIT-529",
    status: "Available" as const,
    officers: "Officer Taylor, Officer Garcia",
    location: "North Station",
    readyToDeploy: true,
  },
  {
    unitId: "UNIT-673",
    status: "En Route" as const,
    officers: "Lt. Anderson, Officer Lee",
    location: "Highway Patrol Zone",
    eta: "6 min",
  },
  {
    unitId: "UNIT-401",
    status: "Available" as const,
    officers: "Officer Kim, Officer White",
    location: "South Station",
    readyToDeploy: true,
  },
  {
    unitId: "UNIT-502",
    status: "En Route" as const,
    officers: "Officer Park, Officer Green",
    location: "Main Street",
    eta: "5 min",
  },
  {
    unitId: "UNIT-789",
    status: "Available" as const,
    officers: "Officer Black, Officer Blue",
    location: "East Station",
    readyToDeploy: true,
  },
]

export default function PatrolUnitsPage() {
  const availableCount = patrolUnits.filter((u) => u.status === "Available").length
  const enRouteCount = patrolUnits.filter((u) => u.status === "En Route").length
  const onCallCount = patrolUnits.filter((u) => u.status === "On Call").length

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">All Patrol Units</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                {availableCount} Available
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">
                {enRouteCount} En Route
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                {onCallCount} Active
              </span>
            </div>
          </div>

          {/* Patrol Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patrolUnits.map((unit) => (
              <PatrolCard key={unit.unitId} {...unit} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
