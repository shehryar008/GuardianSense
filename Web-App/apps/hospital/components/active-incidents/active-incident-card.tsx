"use client"

import { MapPinIcon, ClockIcon, UsersIcon } from "../shared/icons"

type Priority = "critical" | "high" | "medium"
type Status = "In Progress" | "Dispatched" | "En Route"

interface ActiveIncidentCardProps {
  title: string
  priority: Priority
  location: string
  responders: string
  eta: string
  casualties: string
  status: Status
}

const priorityConfig: Record<Priority, { label: string; bgColor: string; textColor: string }> = {
  critical: { label: "CRITICAL", bgColor: "bg-red-500", textColor: "text-white" },
  high: { label: "HIGH", bgColor: "bg-orange-500", textColor: "text-white" },
  medium: { label: "MEDIUM", bgColor: "bg-yellow-400", textColor: "text-yellow-900" },
}

const statusConfig: Record<Status, { bgColor: string; textColor: string }> = {
  "In Progress": { bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
  Dispatched: { bgColor: "bg-teal-50", textColor: "text-teal-600" },
  "En Route": { bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
}

export function ActiveIncidentCard({
  title,
  priority,
  location,
  responders,
  eta,
  casualties,
  status,
}: ActiveIncidentCardProps) {
  const priorityStyle = priorityConfig[priority]
  const statusStyle = statusConfig[status]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        {/* Left section with icon and details */}
        <div className="flex gap-4">
          {/* Alert icon */}
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
              <span className="text-red-500 text-xs font-bold">!</span>
            </div>
          </div>

          {/* Incident details */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-gray-900 font-semibold">{title}</h3>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${priorityStyle.bgColor} ${priorityStyle.textColor}`}
              >
                {priorityStyle.label}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPinIcon className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <span className={`text-sm font-medium px-3 py-1 rounded-lg ${statusStyle.bgColor} ${statusStyle.textColor}`}>
          {status}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-12 mt-4 ml-14">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">Responders</p>
            <p className="text-sm font-medium text-gray-900">{responders}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">ETA</p>
            <p className="text-sm font-medium text-gray-900">{eta}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Casualties</p>
            <p className="text-sm font-medium text-gray-900">{casualties}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
