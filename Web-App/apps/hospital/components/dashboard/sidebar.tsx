"use client"

import {
  HeartIcon,
  LayoutDashboardIcon,
  AlertTriangleIcon,
  AmbulanceIcon,
  UsersIcon,
  BarChartIcon,
  HistoryIcon,
  UserIcon,
  SettingsIcon,
} from "../shared/icons"

const navItems = [
  { icon: LayoutDashboardIcon, label: "Dashboard", active: true },
  { icon: AlertTriangleIcon, label: "Active Incidents", badge: 3 },
  { icon: AmbulanceIcon, label: "Ambulance Fleet" },
  { icon: UsersIcon, label: "Medical Staff" },
  { icon: BarChartIcon, label: "Analytics" },
  { icon: HistoryIcon, label: "Incident History" },
  { icon: UserIcon, label: "Profile" },
  { icon: SettingsIcon, label: "Settings" },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-teal-600 to-teal-700 min-h-screen p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <HeartIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold">GuardianSense</h1>
          <p className="text-teal-200 text-xs">Medical Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              item.active ? "bg-amber-400 text-gray-900 font-medium shadow-lg" : "text-teal-100 hover:bg-white/10"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  item.active ? "bg-gray-900 text-white" : "bg-red-500 text-white"
                }`}
              >
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>
    </aside>
  )
}
