import { MapPinIcon } from "../shared/icons"

type Priority = "CRITICAL" | "MEDIUM" | "LOW"

interface IncidentCardProps {
  priority: Priority
  title: string
  description: string
  location: string
  time: string
}

const priorityStyles: Record<Priority, { bg: string; border: string; badge: string; badgeText: string }> = {
  CRITICAL: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-500",
    badgeText: "text-white",
  },
  MEDIUM: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-400",
    badgeText: "text-gray-900",
  },
  LOW: {
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-500",
    badgeText: "text-white",
  },
}

export function IncidentCard({ priority, title, description, location, time }: IncidentCardProps) {
  const styles = priorityStyles[priority]

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-4`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded ${styles.badge} ${styles.badgeText}`}>
          {priority}
        </span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <MapPinIcon className="w-4 h-4" />
        <span>{location}</span>
      </div>
    </div>
  )
}
