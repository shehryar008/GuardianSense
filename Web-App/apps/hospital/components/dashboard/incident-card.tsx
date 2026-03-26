import { MapPinIcon } from "../shared/icons"

interface IncidentCardProps {
  title: string
  description: string
  location: string
  time: string
  onResolve?: () => void
}

export function IncidentCard({ title, description, location, time, onResolve }: IncidentCardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4`}>
      <div className="flex items-start justify-end mb-2">
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPinIcon className="w-4 h-4" />
          <span>{location}</span>
        </div>
        {onResolve && (
          <button 
            onClick={onResolve}
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium rounded-md transition-colors shadow-sm delay-75"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  )
}
