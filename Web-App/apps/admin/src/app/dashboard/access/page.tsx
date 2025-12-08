"use client"

import { useState } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { Card } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import {
  Zap,
  Building2,
  Shield,
  UserX,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp,
  Hospital,
  Building,
} from "lucide-react"

const stats = [
  { label: "Active Access", value: "5", icon: Zap, color: "bg-green-100 text-green-600" },
  { label: "Hospitals", value: "3", icon: Building2, color: "bg-purple-100 text-purple-600" },
  { label: "Police Stations", value: "2", icon: Shield, color: "bg-blue-100 text-blue-600" },
  { label: "No Access", value: "3", icon: UserX, color: "bg-gray-100 text-gray-600" },
]

const initialFacilities = [
  {
    id: 1,
    name: "Central Medical Center",
    type: "Hospital",
    location: "H001 • Downtown District • Hospital",
    hasAccess: true,
    username: "CMC_ADMIN",
    password: "securepassword123",
    started: "2024-10-10",
    lastLogin: "2 hours ago",
  },
  {
    id: 2,
    name: "Metropolitan Police HQ",
    type: "Police",
    location: "P001 • Central District • Police",
    hasAccess: true,
    username: "METRO_POLICE_HQ",
    password: "policepass456",
    started: "2024-10-30",
    lastLogin: "30 min ago",
  },
  {
    id: 3,
    name: "Riverside General Hospital",
    type: "Hospital",
    location: "H002 • North District • Hospital",
    hasAccess: true,
    username: "RIVERSIDE_ADMIN",
    password: "riversidepass789",
    started: "2024-01-10",
    lastLogin: "1 day ago",
  },
  {
    id: 4,
    name: "Westside Police Station",
    type: "Police",
    location: "P002 • West District • Police Station",
    hasAccess: false,
    username: "",
    password: "",
    started: "",
    lastLogin: "",
  },
  {
    id: 5,
    name: "St. Mary's Hospital",
    type: "Hospital",
    location: "H003 • East District",
    hasAccess: true,
    username: "STMARYS_ADMIN",
    password: "stmaryspass123",
    started: "2024-12-10",
    lastLogin: "3 hours ago",
  },
  {
    id: 6,
    name: "Northside Police Station",
    type: "Police",
    location: "P003 • North District • Police Station",
    hasAccess: false,
    username: "",
    password: "",
    started: "",
    lastLogin: "",
  },
  {
    id: 7,
    name: "Eastside Medical Facility",
    type: "Hospital",
    location: "H004 • East District • Hospital",
    hasAccess: false,
    username: "",
    password: "",
    started: "",
    lastLogin: "",
  },
  {
    id: 8,
    name: "Harbor Police Department",
    type: "Police",
    location: "P004 • Harbor District • Police",
    hasAccess: true,
    username: "HARBOR_PD",
    password: "harborpass456",
    started: "2024-11-05",
    lastLogin: "5 min ago",
  },
]

export default function AccessManagementPage() {
  const [expandedFacility, setExpandedFacility] = useState<number | null>(1)
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({})
  const [facilities, setFacilities] = useState(initialFacilities)

  const togglePassword = (id: number) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const updateFacility = (id: number, field: "username" | "password", value: string) => {
    setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Access Management</h1>
            <p className="text-gray-500 text-sm">Manage login credentials for hospitals and police stations</p>
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

          {/* Facilities Access Control */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facilities Access Control</h2>
            <div className="space-y-3">
              {facilities.map((facility) => (
                <div key={facility.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Facility Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedFacility(expandedFacility === facility.id ? null : facility.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          facility.type === "Hospital" ? "bg-red-100" : "bg-blue-100"
                        }`}
                      >
                        {facility.type === "Hospital" ? (
                          <Hospital className="w-5 h-5 text-red-600" />
                        ) : (
                          <Building className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{facility.name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              facility.hasAccess ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {facility.hasAccess ? "Active" : "No Access"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{facility.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {facility.hasAccess ? (
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          Revoke
                        </Button>
                      ) : (
                        <Button className="bg-green-500 hover:bg-green-600 text-white">Grant Access</Button>
                      )}
                      {expandedFacility === facility.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedFacility === facility.id && facility.hasAccess && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">Username</label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={facility.username}
                              onChange={(e) => updateFacility(facility.id, "username", e.target.value)}
                              className="bg-white border-gray-300 text-black"
                              placeholder="Enter username"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => copyToClipboard(facility.username)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-end gap-4">
                          <div className="text-sm text-gray-500">
                            <p>Started:</p>
                            <p className="text-gray-900">{facility.started}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            <p>Last login:</p>
                            <p className="text-gray-900">{facility.lastLogin}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-sm text-gray-500 mb-1 block">Password</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showPasswords[facility.id] ? "text" : "password"}
                            value={facility.password}
                            onChange={(e) => updateFacility(facility.id, "password", e.target.value)}
                            className="bg-white border-gray-300 text-black"
                            placeholder="Enter password"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => togglePassword(facility.id)}
                          >
                            {showPasswords[facility.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => copyToClipboard(facility.password)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
