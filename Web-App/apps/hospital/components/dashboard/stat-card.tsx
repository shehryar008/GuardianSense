import type React from "react"
import { TrendingUpIcon } from "../shared/icons"

interface StatCardProps {
  icon: React.ReactNode
  iconBgColor: string
  value: string
  label: string
  subtext: string
  subtextColor: string
}

export function StatCard({ icon, iconBgColor, value, label, subtext, subtextColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor}`}>{icon}</div>
        <TrendingUpIcon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
      <div className={`text-sm mt-1 ${subtextColor}`}>{subtext}</div>
    </div>
  )
}
