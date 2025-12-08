"use client"

import type React from "react"

import { TrendingUpIcon, TrendingDownIcon } from "../../components/shared/icons"

interface AnalyticsCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  trend?: string
  trendUp?: boolean
  iconBgColor: string
  iconColor: string
}

export function AnalyticsCard({ icon, value, label, trend, trendUp, iconBgColor, iconColor }: AnalyticsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBgColor }}>
          <div style={{ color: iconColor }}>{icon}</div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trendUp ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
            {trend}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}
