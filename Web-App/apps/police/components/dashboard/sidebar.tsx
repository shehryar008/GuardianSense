"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  PoliceBadgeIcon,
  LayoutDashboardIcon,
  AlertTriangleIcon,
  CarIcon,
  UsersIcon,
  BarChartIcon,
  FolderIcon,
  UserIcon,
  SettingsIcon,
} from "../shared/icons"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Active Incidents", href: "/dashboard/incidents", icon: AlertTriangleIcon, badge: 5 },
  { name: "Patrol Units", href: "/dashboard/patrol", icon: CarIcon },
  { name: "Officers on Duty", href: "/dashboard/officers", icon: UsersIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChartIcon },
  { name: "Case History", href: "/dashboard/cases", icon: FolderIcon },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <PoliceBadgeIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm">GuardianSense</h1>
          <p className="text-xs text-blue-200">Command Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-white text-blue-600" : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    isActive ? "bg-blue-100 text-blue-600" : "bg-red-500 text-white"
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
