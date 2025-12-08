"use client"

import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { Card } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Search, Filter, FileText, FileSpreadsheet, Calendar, ChevronDown } from "lucide-react"

const reports = [
  { id: "R-2501", type: "Incident", department: "Police", date: "2025-10-07", status: "Completed", priority: "High" },
  {
    id: "R-2502",
    type: "Medical",
    department: "Hospital",
    date: "2025-10-07",
    status: "Completed",
    priority: "Critical",
  },
  { id: "R-2503", type: "Incident", department: "Police", date: "2025-10-06", status: "Completed", priority: "Medium" },
  {
    id: "R-2504",
    type: "Medical",
    department: "Hospital",
    date: "2025-10-06",
    status: "In Progress",
    priority: "High",
  },
  { id: "R-2505", type: "Combined", department: "Both", date: "2025-10-05", status: "Completed", priority: "Critical" },
  { id: "R-2506", type: "Incident", department: "Police", date: "2025-10-05", status: "Completed", priority: "Low" },
  {
    id: "R-2507",
    type: "Medical",
    department: "Hospital",
    date: "2025-10-04",
    status: "Completed",
    priority: "Medium",
  },
  { id: "R-2508", type: "Analytics", department: "Both", date: "2025-10-04", status: "Completed", priority: "Medium" },
]

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-600"
    case "High":
      return "bg-orange-100 text-orange-600"
    case "Medium":
      return "bg-blue-100 text-blue-600"
    case "Low":
      return "bg-gray-100 text-gray-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Completed":
      return "text-green-600"
    case "In Progress":
      return "text-yellow-600"
    default:
      return "text-gray-600"
  }
}

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Report Generation</h1>
            <p className="text-gray-500 text-sm">Create, filter, and export comprehensive reports</p>
          </div>

          {/* Report Filters */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">From Date</label>
                <div className="relative">
                  <Input type="text" placeholder="Pick a date" className="pl-10" />
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">To Date</label>
                <div className="relative">
                  <Input type="text" placeholder="Pick a date" className="pl-10" />
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Report Type</label>
                <div className="relative">
                  <select className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-md bg-white text-sm appearance-none">
                    <option>All Types</option>
                    <option>Incident</option>
                    <option>Medical</option>
                    <option>Combined</option>
                    <option>Analytics</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Department</label>
                <div className="relative">
                  <select className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-md bg-white text-sm appearance-none">
                    <option>All Departments</option>
                    <option>Police</option>
                    <option>Hospital</option>
                    <option>Both</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline">Reset</Button>
            </div>
          </Card>

          {/* Generated Reports */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Generated Reports</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input type="text" placeholder="Search reports..." className="pl-10 w-64" />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Report ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{report.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.department}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.date}</td>
                      <td className={`py-3 px-4 text-sm ${getStatusStyle(report.status)}`}>{report.status}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityStyle(report.priority)}`}>
                          {report.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-sm text-gray-600 hover:text-purple-600">View</button>
                          <button className="text-sm text-gray-600 hover:text-purple-600">Download</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-gray-500 mb-1">Total Reports Generated</p>
              <p className="text-3xl font-semibold text-gray-900">1,247</p>
              <p className="text-sm text-gray-400 mt-2">Last 30 days</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-500 mb-1">Average Generation Time</p>
              <p className="text-3xl font-semibold text-gray-900">2.3s</p>
              <p className="text-sm text-green-500 mt-2">↓ 0.5s improvement</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-500 mb-1">Most Requested Type</p>
              <p className="text-3xl font-semibold text-gray-900">Incident</p>
              <p className="text-sm text-gray-400 mt-2">456 requests</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
