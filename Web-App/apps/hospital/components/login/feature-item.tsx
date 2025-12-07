import type React from "react"

interface FeatureItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-teal-700 mt-1">{description}</p>
      </div>
    </div>
  )
}
