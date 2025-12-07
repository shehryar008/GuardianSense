"use client"

import { SirenIcon } from "../shared/icons"

interface CriticalAlertProps {
  message: string
  onRespond?: () => void
}

export function CriticalAlert({ message, onRespond }: CriticalAlertProps) {
  return (
    <div className="bg-red-500 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-400/50 rounded-lg flex items-center justify-center">
          <SirenIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xs font-semibold bg-red-400/50 text-white px-2 py-0.5 rounded">CRITICAL ALERT</span>
          <p className="text-white text-sm mt-1">{message}</p>
        </div>
      </div>
      <button
        onClick={onRespond}
        className="px-6 py-2 bg-white text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
      >
        Respond
      </button>
    </div>
  )
}
