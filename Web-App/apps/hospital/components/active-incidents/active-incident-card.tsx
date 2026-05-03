"use client"

import { MapPinIcon } from "../shared/icons"

type Status = "Pending" | "En Route" | "Resolved"

interface ActiveIncidentCardProps {
  title: string
  location: string
  status: Status
  onResolve?: () => void
}

const statusConfig: Record<Status, { bgColor: string; textColor: string }> = {
  "Pending": { bgColor: "bg-amber-50", textColor: "text-amber-600" },
  "En Route": { bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
  "Resolved": { bgColor: "bg-gray-50", textColor: "text-gray-600" },
}

const defaultStatusStyle = { bgColor: "bg-gray-50", textColor: "text-gray-600" }

export function ActiveIncidentCard({
  title,
  location,
  status,
  onResolve,
}: ActiveIncidentCardProps) {
  const statusStyle = statusConfig[status] || defaultStatusStyle

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between">
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
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPinIcon className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1 rounded-lg ${statusStyle.bgColor} ${statusStyle.textColor}`}>
            {status}
          </span>
          {onResolve && (
            <button
              onClick={onResolve}
              className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

