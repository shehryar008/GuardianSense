"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShieldIcon,
  LayoutDashboardIcon,
  BuildingIcon,
  BadgeIcon,
  BarChart3Icon,
  FileTextIcon,
  UsersIcon,
  ClockIcon,
  SettingsIcon,
  KeyRoundIcon, // Added KeyRoundIcon import
} from "../../components/shared/icons"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Hospital Data", href: "/dashboard/hospital", icon: BuildingIcon },
  { name: "Police Data", href: "/dashboard/police", icon: BadgeIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3Icon },
  { name: "Reports", href: "/dashboard/reports", icon: FileTextIcon },
  { name: "Access Management", href: "/dashboard/access", icon: KeyRoundIcon }, // Added Access Management nav item
  { name: "Personnel", href: "/dashboard/personnel", icon: UsersIcon },
  { name: "Activity Log", href: "/dashboard/activity", icon: ClockIcon },
  { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-gradient-to-b from-violet-700 to-violet-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <ShieldIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm">GuardianSense</h1>
          <p className="text-[10px] text-violet-200">Administration Center</p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? "bg-pink-500/80 text-white" : "text-violet-100 hover:bg-white/10"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
