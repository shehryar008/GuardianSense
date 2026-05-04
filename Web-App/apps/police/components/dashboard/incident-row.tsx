"use client"

import { MapPinIcon, ClockIcon } from "../../components/shared/icons"

interface IncidentRowProps {
  title: string
  location: string
  timeAgo: string
  onAction?: () => void
  actionLabel?: string
  isActionLoading?: boolean
}

export function IncidentRow({ title, location, timeAgo, onAction, actionLabel, isActionLoading }: IncidentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {onAction && (
          <button 
            onClick={onAction}
            disabled={isActionLoading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isActionLoading ? "Loading..." : (actionLabel || "Action")}
          </button>
        )}
      </div>
    </div>
  )
}
