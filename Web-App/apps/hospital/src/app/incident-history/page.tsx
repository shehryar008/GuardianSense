import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { LocationIcon, CalendarIcon, ClockIcon } from "../../../components/shared/icons"

const incidents = [
  {
    type: "Vehicle Collision",
    location: "Highway 9A Main Rd",
    date: "Dec 9, 2025 - 08:45 AM",
    duration: "18 min",
    severity: "Critical",
    status: "Resolved",
  },
  {
    type: "Cardiac Emergency",
    location: "E Main West Road, CA",
    date: "Dec 9, 2025 - 07:30 AM",
    duration: "12 min",
    severity: "High",
    status: "Resolved",
  },
  {
    type: "Fire Hazard",
    location: "W 6TH ST, 3rd-20th",
    date: "Dec 9, 2025 - 06:15 AM",
    duration: "25 min",
    severity: "Medium",
    status: "Resolved",
  },
  {
    type: "Medical Emergency",
    location: "Downtown Plaza",
    date: "Dec 8, 2025 - 11:20 PM",
    duration: "15 min",
    severity: "High",
    status: "Resolved",
  },
  {
    type: "Vehicle Collision",
    location: "Interstate 405",
    date: "Dec 8, 2025 - 09:40 PM",
    duration: "22 min",
    severity: "Critical",
    status: "Resolved",
  },
  {
    type: "Respiratory Distress",
    location: "Oak Street Apartments",
    date: "Dec 8, 2025 - 08:15 PM",
    duration: "10 min",
    severity: "Medium",
    status: "Resolved",
  },
]

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    Critical: "bg-red-100 text-red-600",
    High: "bg-red-100 text-red-600",
    Medium: "bg-gray-200 text-gray-600",
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[severity as keyof typeof colors]}`}>
      {severity}
    </span>
  )
}

export default function IncidentHistoryPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Incident History" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Incident History</h1>
            <p className="text-gray-500">Complete record of past incidents and responses</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident Type
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidents.map((incident, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{incident.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <LocationIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{incident.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{incident.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{incident.duration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={incident.severity} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">{incident.status}</span>
                      </div>
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
