import type React from "react"

interface FeatureItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      </div>
    </div>
  )
}
