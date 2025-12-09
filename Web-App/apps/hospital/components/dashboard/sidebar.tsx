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
import Link from "next/link"

const navItems = [
  { icon: LayoutDashboardIcon, label: "Dashboard", href: "/dashboard" },
  { icon: AlertTriangleIcon, label: "Active Incidents", badge: 3, href: "/active-incidents" },
  { icon: AmbulanceIcon, label: "Ambulance Fleet", href: "/ambulance-fleet" },
  { icon: UsersIcon, label: "Medical Staff", href: "/medical-staff" },
  { icon: BarChartIcon, label: "Analytics", href: "/analytics" },
  { icon: HistoryIcon, label: "Incident History", href: "/incident-history" },
  { icon: UserIcon, label: "Profile", href: "/profile" },
  { icon: SettingsIcon, label: "Settings", href: "/settings" },
]

interface SidebarProps {
  activeItem?: string
}

export function Sidebar({ activeItem = "Dashboard" }: SidebarProps) {
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
        {navItems.map((item) => {
          const isActive = item.label === activeItem
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? "bg-amber-400 text-gray-900 font-medium shadow-lg" : "text-teal-100 hover:bg-white/10"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    isActive ? "bg-gray-900 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
