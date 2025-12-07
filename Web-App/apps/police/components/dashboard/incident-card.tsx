import { MapPinIcon } from "../shared/icons"

interface IncidentCardProps {
  priority: "CRITICAL" | "HIGH" | "MEDIUM"
  title: string
  description: string
  location: string
  time: string
  status: "dispatched" | "en-route" | "investigating"
}

const priorityStyles = {
  CRITICAL: "bg-red-500 text-white",
  HIGH: "bg-orange-500 text-white",
  MEDIUM: "bg-yellow-400 text-yellow-900",
}

const statusStyles = {
  dispatched: "border-blue-500 text-blue-600 bg-blue-50",
  "en-route": "border-yellow-500 text-yellow-600 bg-yellow-50",
  investigating: "border-orange-500 text-orange-600 bg-orange-50",
}

const cardBorderStyles = {
  CRITICAL: "border-l-red-500",
  HIGH: "border-l-orange-500",
  MEDIUM: "border-l-yellow-400",
}

export function IncidentCard({ priority, title, description, location, time, status }: IncidentCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${cardBorderStyles[priority]} p-4`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${priorityStyles[priority]}`}>{priority}</span>
        <span className="text-xs text-gray-400">{time}</span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>

      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
        <MapPinIcon className="w-4 h-4" />
        <span>{location}</span>
      </div>

      <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${statusStyles[status]}`}>
        {status}
      </span>
    </div>
  )
}
