import type { ReactNode } from "react"

interface FeatureItemProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-500 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}
