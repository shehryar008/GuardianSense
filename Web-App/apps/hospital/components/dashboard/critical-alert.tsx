import { AlertTriangleIcon } from "../shared/icons"

interface CriticalAlertProps {
  message: string
}

export function CriticalAlert({ message }: CriticalAlertProps) {
  return (
    <div className="bg-red-500 rounded-xl p-4 flex items-center justify-between text-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <AlertTriangleIcon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">CRITICAL ALERT</span>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
      <button className="px-6 py-2 bg-white text-red-500 rounded-lg font-medium hover:bg-gray-100 transition-colors">
        Check Now
      </button>
    </div>
  )
}
