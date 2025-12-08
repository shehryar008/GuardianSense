"use client"

import { MapPinIcon, ClockIcon, UserIcon } from "../../components/shared/icons"

interface IncidentRowProps {
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  title: string
  location: string
  timeAgo: string
  unit: string
  status: "Active" | "En Route" | "Investigating" | "Resolved"
}

const priorityStyles = {
  CRITICAL: "bg-red-500 text-white",
  HIGH: "bg-orange-500 text-white",
  MEDIUM: "bg-yellow-400 text-yellow-900",
  LOW: "bg-green-500 text-white",
}

const statusStyles = {
  Active: "bg-gray-100 text-gray-600 border border-gray-300",
  "En Route": "bg-gray-100 text-gray-600 border border-gray-300",
  Investigating: "bg-gray-100 text-gray-600 border border-gray-300",
  Resolved: "bg-gray-100 text-gray-600 border border-gray-300",
}

export function IncidentRow({ priority, title, location, timeAgo, unit, status }: IncidentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        <span className={`px-2.5 py-1 text-xs font-bold rounded ${priorityStyles[priority]}`}>{priority}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              {unit}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>{status}</span>
        <button className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          View Details
        </button>
      </div>
    </div>
  )
}
