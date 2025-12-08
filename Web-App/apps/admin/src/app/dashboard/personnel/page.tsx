"use client"

import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { Card } from "../../../../components/ui/card"
import { Users, Zap, Phone, UserX } from "lucide-react"

const stats = [
  { label: "Total Personnel", value: "234", icon: Users, color: "bg-purple-100 text-purple-600" },
  { label: "On Duty", value: "156", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { label: "On Call", value: "42", icon: Phone, color: "bg-green-100 text-green-600" },
  { label: "Off Duty", value: "36", icon: UserX, color: "bg-gray-100 text-gray-600" },
]

const personnel = [
  { name: "Dr. Sarah Chen", role: "Emergency Physician", department: "Hospital", shift: "", status: "On Duty" },
  { name: "Officer Mike Johnson", role: "Patrol Officer", department: "Police", shift: "Night", status: "On Duty" },
  { name: "Paramedic James Lee", role: "EMT Supervisor", department: "Hospital", shift: "", status: "On Call" },
  { name: "Sgt. Maria Rodriguez", role: "Sergeant", department: "Police", shift: "", status: "On Call" },
  { name: "Nurse Emily Watson", role: "ICU Nurse", department: "Hospital", shift: "Night", status: "On Duty" },
  { name: "Det. Robert Taylor", role: "Detective", department: "Police", shift: "", status: "Off Duty" },
]

export default function PersonnelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Personnel Management</h1>
            <p className="text-gray-500 text-sm">Active staff and duty assignments</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Active Personnel */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Personnel</h2>
            <div className="space-y-3">
              {personnel.map((person, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-500">
                        {person.role} • <span className="text-gray-400">{person.department}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {person.shift && <span className="text-sm text-gray-500">Shift: {person.shift}</span>}
                    {!person.shift && <span className="text-sm text-gray-500">Shift:</span>}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        person.status === "On Duty"
                          ? "bg-green-100 text-green-600"
                          : person.status === "On Call"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {person.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
