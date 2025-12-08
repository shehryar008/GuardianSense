"use client"

import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from "../../components/shared/icons"

interface OfficerCardProps {
  name: string
  badge: string
  status: "On Duty" | "Available"
  unit: string
  shift: string
  location: string
  phone: string
  initials: string
  color: string
}

export function OfficerCard({ name, badge, status, unit, shift, location, phone, initials, color }: OfficerCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">Badge</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
              status === "On Duty" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </div>
          <span className="text-gray-600">{unit}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{shift}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <PhoneIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{phone}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <PhoneIcon className="w-4 h-4" />
          Call
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <MailIcon className="w-4 h-4" />
          Message
        </button>
      </div>
    </div>
  )
}
