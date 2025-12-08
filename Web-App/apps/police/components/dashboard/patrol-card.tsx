"use client"

import { MapPinIcon, ClockIcon, PhoneIcon, PatrolCarIcon } from "../../components/shared/icons"

interface PatrolCardProps {
  unitId: string
  status: "On Call" | "Available" | "En Route"
  officers: string
  location: string
  eta?: string
  readyToDeploy?: boolean
}

const statusStyles = {
  "On Call": "bg-red-500 text-white",
  Available: "bg-green-500 text-white",
  "En Route": "bg-orange-500 text-white",
}

const carColors = {
  "On Call": "text-red-500",
  Available: "text-green-500",
  "En Route": "text-orange-500",
}

export function PatrolCard({ unitId, status, officers, location, eta, readyToDeploy }: PatrolCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <PatrolCarIcon className={`w-8 h-8 ${carColors[status]}`} />
          <div>
            <h3 className="font-bold text-gray-900">{unitId}</h3>
            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded mt-1 ${statusStyles[status]}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
          </svg>
          {officers}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          {location}
        </div>
        {eta && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <ClockIcon className="w-4 h-4" />
            ETA: {eta}
          </div>
        )}
        {readyToDeploy && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Ready to deploy
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <PhoneIcon className="w-4 h-4" />
          Contact
        </button>
        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Track
        </button>
      </div>
    </div>
  )
}
