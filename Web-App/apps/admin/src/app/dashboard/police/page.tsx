import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { SearchIcon, FilterIcon, DownloadIcon } from "../../../../components/shared/icons"

const incidents = [
  {
    id: "I-5678",
    type: "Robbery",
    location: "Main St & 5th Ave",
    priority: "Critical",
    officer: "J. Thompson",
    time: "2025-10-07 15:22",
    status: "Active",
  },
  {
    id: "I-5679",
    type: "Domestic Dispute",
    location: "123 Oak Avenue",
    priority: "High",
    officer: "M. Rodriguez",
    time: "2025-10-07 14:10",
    status: "Resolved",
  },
  {
    id: "I-5680",
    type: "Traffic Violation",
    location: "Highway 101",
    priority: "Low",
    officer: "K. Lee",
    time: "2025-10-07 13:45",
    status: "Active",
  },
  {
    id: "I-5681",
    type: "Burglary",
    location: "456 Elm Street",
    priority: "High",
    officer: "R. Patel",
    time: "2025-10-06 22:30",
    status: "Investigating",
  },
  {
    id: "I-5682",
    type: "Assault",
    location: "City Park",
    priority: "Critical",
    officer: "T. White",
    time: "2025-10-06 18:15",
    status: "Active",
  },
  {
    id: "I-5683",
    type: "Vandalism",
    location: "789 Pine Road",
    priority: "Medium",
    officer: "A. Garcia",
    time: "2025-10-06 16:00",
    status: "Resolved",
  },
  {
    id: "I-5684",
    type: "Suspicious Activity",
    location: "Downtown Plaza",
    priority: "Medium",
    officer: "S. Johnson",
    time: "2025-10-05 20:45",
    status: "Investigating",
  },
  {
    id: "I-5685",
    type: "Theft",
    location: "Shopping Mall",
    priority: "High",
    officer: "D. Brown",
    time: "2025-10-05 14:20",
    status: "Resolved",
  },
]

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "bg-red-500 text-white"
    case "High":
      return "bg-orange-500 text-white"
    case "Medium":
      return "bg-blue-500 text-white"
    case "Low":
      return "bg-green-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-500 text-white"
    case "Resolved":
      return "bg-blue-500 text-white"
    case "Investigating":
      return "bg-yellow-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export default function PoliceDataPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Police Data Management</h1>
            <p className="text-gray-500 text-sm">Detailed data and case management</p>
          </div>

          {/* Data Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Search and Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-[300px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <FilterIcon className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">
                  <DownloadIcon className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Incident ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Officer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-violet-600 font-medium">{incident.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{incident.type}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{incident.location}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityBadge(incident.priority)}`}
                        >
                          {incident.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{incident.officer}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{incident.time}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(incident.status)}`}
                        >
                          {incident.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <button className="text-sm text-gray-600 hover:text-violet-600">View</button>
                          <button className="text-sm text-gray-600 hover:text-violet-600">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Showing 8 of 8 entries</p>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded">Previous</button>
                <button className="px-3 py-1.5 text-sm text-white bg-violet-600 rounded">1</button>
                <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">2</button>
                <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">3</button>
                <button className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
