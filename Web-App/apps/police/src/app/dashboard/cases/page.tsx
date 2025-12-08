import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import {
  FileIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SearchIcon,
  CalendarIcon,
  FilterIcon,
  DownloadIcon,
  EyeIcon,
} from "../../../../components/shared/icons"

const stats = [
  { icon: FileIcon, value: "847", label: "Total Cases", bgColor: "bg-gray-50" },
  { icon: CheckCircleIcon, value: "723", label: "Closed Cases", bgColor: "bg-green-50", iconColor: "text-green-600" },
  { icon: ClockIcon, value: "94", label: "Under Review", bgColor: "bg-yellow-50", iconColor: "text-yellow-600" },
  { icon: XCircleIcon, value: "30", label: "Dismissed", bgColor: "bg-red-50", iconColor: "text-red-600" },
]

const cases = [
  {
    id: "CASE-2024-001",
    title: "Armed Robbery - Downtown Bank",
    date: "Dec 7, 2024",
    officer: "Det. Martinez",
    location: "Main Street Bank",
    priority: "CRITICAL",
    status: "Closed",
    outcome: "Arrested",
  },
  {
    id: "CASE-2024-002",
    title: "Domestic Violence Report",
    date: "Dec 7, 2024",
    officer: "Officer Chen",
    location: "Riverside Apartments #4B",
    priority: "HIGH",
    status: "Closed",
    outcome: "Resolved",
  },
  {
    id: "CASE-2024-003",
    title: "Vehicle Theft Investigation",
    date: "Dec 6, 2024",
    officer: "Det. Brown",
    location: "East Side Parking Lot",
    priority: "MEDIUM",
    status: "Under Review",
    outcome: "Pending",
  },
  {
    id: "CASE-2024-004",
    title: "Hit and Run Accident",
    date: "Dec 6, 2024",
    officer: "Officer Davis",
    location: "Highway 101 North",
    priority: "HIGH",
    status: "Closed",
    outcome: "Arrested",
  },
  {
    id: "CASE-2024-005",
    title: "Burglary - Residential",
    date: "Dec 5, 2024",
    officer: "Sgt. Williams",
    location: "Oak Street Residence",
    priority: "HIGH",
    status: "Closed",
    outcome: "Arrested",
  },
  {
    id: "CASE-2024-006",
    title: "Vandalism Report",
    date: "Dec 5, 2024",
    officer: "Officer Johnson",
    location: "Central Park",
    priority: "LOW",
    status: "Closed",
    outcome: "Resolved",
  },
  {
    id: "CASE-2024-007",
    title: "Assault Investigation",
    date: "Dec 4, 2024",
    officer: "Det. Martinez",
    location: "Downtown Bar",
    priority: "CRITICAL",
    status: "Closed",
    outcome: "Arrested",
  },
  {
    id: "CASE-2024-008",
    title: "Missing Person Found",
    date: "Dec 4, 2024",
    officer: "Officer Taylor",
    location: "City Mall",
    priority: "MEDIUM",
    status: "Closed",
    outcome: "Resolved",
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-100 text-red-700"
    case "HIGH":
      return "bg-orange-100 text-orange-700"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700"
    case "LOW":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Closed":
      return "bg-red-100 text-red-700"
    case "Under Review":
      return "bg-yellow-100 text-yellow-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function CaseHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${stat.bgColor} rounded-xl border border-gray-200 p-4 flex items-center gap-4`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor || "text-gray-600"}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by case ID, title, officer, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <CalendarIcon className="w-4 h-4" />
                Date Range
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <FilterIcon className="w-4 h-4" />
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <DownloadIcon className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-blue-600">{caseItem.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{caseItem.title}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">{caseItem.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{caseItem.officer}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">{caseItem.location}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(
                          caseItem.priority,
                        )}`}
                      >
                        {caseItem.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                          caseItem.status,
                        )}`}
                      >
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{caseItem.outcome}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <EyeIcon className="w-5 h-5" />
                      </button>
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
