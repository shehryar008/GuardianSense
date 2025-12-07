import type React from "react"
import { TrendingUpIcon } from "../shared/icons"

interface StatCardProps {
  icon: React.ReactNode
  iconBgColor: string
  value: string | number
  label: string
  subtext?: string
  subtextColor?: string
}

export function StatCard({ icon, iconBgColor, value, label, subtext, subtextColor = "text-green-500" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>{icon}</div>
        <TrendingUpIcon className="w-4 h-4 text-green-500" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {subtext && <div className={`text-xs ${subtextColor} mt-1`}>{subtext}</div>}
    </div>
  )
}
