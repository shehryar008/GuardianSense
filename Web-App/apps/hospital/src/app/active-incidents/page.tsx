import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { ActiveIncidentCard } from "../../../components/active-incidents/active-incident-card"

const incidents = [
  {
    id: 1,
    title: "Vehicle Collision",
    priority: "critical" as const,
    location: "Highway 9A Main Rd",
    responders: "3 units",
    eta: "2 min",
    casualties: "Multiple",
    status: "In Progress" as const,
  },
  {
    id: 2,
    title: "Cardiac Emergency",
    priority: "high" as const,
    location: "E Main West Road, CA",
    responders: "2 units",
    eta: "5 min",
    casualties: "1 patient",
    status: "Dispatched" as const,
  },
  {
    id: 3,
    title: "Fire Hazard",
    priority: "medium" as const,
    location: "W 6TH ST, 3rd-20th",
    responders: "4 units",
    eta: "8 min",
    casualties: "Unknown",
    status: "En Route" as const,
  },
]

export default function ActiveIncidentsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Active Incidents" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Active Incidents</h1>
            <p className="text-gray-500 mt-1">Currently active emergency situations requiring immediate attention</p>
          </div>

          {/* Incident cards */}
          <div className="space-y-4">
            {incidents.map((incident) => (
              <ActiveIncidentCard
                key={incident.id}
                title={incident.title}
                priority={incident.priority}
                location={incident.location}
                responders={incident.responders}
                eta={incident.eta}
                casualties={incident.casualties}
                status={incident.status}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
