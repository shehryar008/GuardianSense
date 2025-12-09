import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { LocationIcon, UsersIcon, AmbulanceIcon } from "../../../components/shared/icons"

const ambulances = [
  {
    id: "AMB-001",
    status: "On Mission",
    location: "Highway 9A Main Rd",
    crew: "Team Alpha",
    equipment: "Full",
    fuelLevel: 85,
  },
  {
    id: "AMB-002",
    status: "Available",
    location: "Station 3",
    crew: "Team Bravo",
    equipment: "Full",
    fuelLevel: 95,
  },
  {
    id: "AMB-003",
    status: "En Route",
    location: "E Main West Road",
    crew: "Team Charlie",
    equipment: "Full",
    fuelLevel: 70,
  },
  {
    id: "AMB-004",
    status: "Available",
    location: "Station 1",
    crew: "Team Delta",
    equipment: "Full",
    fuelLevel: 100,
  },
  {
    id: "AMB-005",
    status: "Maintenance",
    location: "Garage B",
    crew: "N/A",
    equipment: "Limited",
    fuelLevel: 45,
  },
  {
    id: "AMB-006",
    status: "Available",
    location: "Station 2",
    crew: "Team Echo",
    equipment: "Full",
    fuelLevel: 88,
  },
]

function StatusBadge({ status }: { status: string }) {
  const colors = {
    "On Mission": "bg-orange-100 text-orange-600",
    Available: "bg-green-100 text-green-600",
    "En Route": "bg-red-100 text-red-600",
    Maintenance: "bg-yellow-100 text-yellow-600",
  }
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}

function FuelBar({ level }: { level: number }) {
  const color = level > 70 ? "bg-teal-500" : level > 40 ? "bg-yellow-400" : "bg-red-500"
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Fuel Level</span>
        <span className="text-xs text-gray-600">{level}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${level}%` }} />
      </div>
    </div>
  )
}

function AmbulanceCard({
  id,
  status,
  location,
  crew,
  equipment,
  fuelLevel,
}: {
  id: string
  status: string
  location: string
  crew: string
  equipment: string
  fuelLevel: number
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
            <AmbulanceIcon className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{id}</h3>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <LocationIcon className="w-4 h-4 text-gray-400" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon className="w-4 h-4 text-gray-400" />
          <span>Crew: {crew}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="text-gray-500">Equipment:</span> {equipment}
        </div>
      </div>
      <FuelBar level={fuelLevel} />
    </div>
  )
}

export default function AmbulanceFleetPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Ambulance Fleet" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Ambulance Fleet</h1>
            <p className="text-gray-500">Real-time status of all ambulance units</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambulances.map((ambulance, index) => (
              <AmbulanceCard key={index} {...ambulance} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
