import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { SearchIcon, FilterIcon, DownloadIcon } from "../../../../components/shared/icons"

const patients = [
  {
    id: "P-10234",
    name: "John Doe",
    age: 45,
    department: "Emergency",
    condition: "Critical",
    admitted: "2025-10-07 14:30",
    status: "Active",
  },
  {
    id: "P-10235",
    name: "Jane Smith",
    age: 32,
    department: "ICU",
    condition: "Stable",
    admitted: "2025-10-06 09:15",
    status: "Active",
  },
  {
    id: "P-10236",
    name: "Robert Johnson",
    age: 67,
    department: "Cardiology",
    condition: "Critical",
    admitted: "2025-10-06 16:45",
    status: "Active",
  },
  {
    id: "P-10237",
    name: "Emily Davis",
    age: 28,
    department: "Maternity",
    condition: "Good",
    admitted: "2025-10-05 11:20",
    status: "Discharged",
  },
  {
    id: "P-10238",
    name: "Michael Wilson",
    age: 54,
    department: "Surgery",
    condition: "Stable",
    admitted: "2025-10-05 08:00",
    status: "Active",
  },
  {
    id: "P-10239",
    name: "Sarah Brown",
    age: 41,
    department: "Emergency",
    condition: "Stable",
    admitted: "2025-10-04 19:30",
    status: "Active",
  },
  {
    id: "P-10240",
    name: "David Martinez",
    age: 36,
    department: "ICU",
    condition: "Critical",
    admitted: "2025-10-04 13:45",
    status: "Active",
  },
  {
    id: "P-10241",
    name: "Lisa Anderson",
    age: 59,
    department: "Orthopedics",
    condition: "Good",
    admitted: "2025-10-03 10:15",
    status: "Discharged",
  },
]

const getConditionBadge = (condition: string) => {
  switch (condition) {
    case "Critical":
      return "bg-red-100 text-red-600 border border-red-200"
    case "Stable":
      return "bg-gray-100 text-gray-600 border border-gray-200"
    case "Good":
      return "bg-green-100 text-green-600 border border-green-200"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-500 text-white"
    case "Discharged":
      return "bg-blue-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export default function HospitalDataPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Hospital Data Management</h1>
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
                  placeholder="Search patients..."
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
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Age</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Condition</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Admitted</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-violet-600 font-medium">{patient.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{patient.name}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{patient.age}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{patient.department}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getConditionBadge(patient.condition)}`}
                        >
                          {patient.condition}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{patient.admitted}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(patient.status)}`}
                        >
                          {patient.status}
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
