import { MapPinIcon } from "../shared/icons"

interface IncidentCardProps {
  title: string
  description: string
  location: string
  time: string
  onAction?: () => void
  actionLabel?: string
  isActionLoading?: boolean
}

export function IncidentCard({ title, description, location, time, onAction, actionLabel, isActionLoading }: IncidentCardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4`}>
      <div className="flex items-start justify-end mb-2">
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPinIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        {onAction && (
          <button 
            onClick={onAction}
            disabled={isActionLoading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 shrink-0 ml-2"
          >
            {isActionLoading ? "..." : (actionLabel || "Action")}
          </button>
        )}
      </div>
    </div>
  )
}
