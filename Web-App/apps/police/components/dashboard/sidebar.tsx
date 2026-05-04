"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  PoliceBadgeIcon,
  LayoutDashboardIcon,
  AlertTriangleIcon,
  FolderIcon,
  UserIcon,
  SettingsIcon,
} from "../shared/icons"
import { useAuth } from "../auth/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Active Incidents", href: "/dashboard/incidents", icon: AlertTriangleIcon, hasBadge: true },
  { name: "Case History", href: "/dashboard/cases", icon: FolderIcon },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const { token, logout } = useAuth()
  const [incidentCount, setIncidentCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      if (!token) return
      try {
        const res = await fetch(`${API_URL}/api/police/incidents/active`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) setIncidentCount(data.data?.length || 0)
      } catch {
        // silently fail
      }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 15000)
    return () => clearInterval(interval)
  }, [token])

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
              {item.hasBadge && incidentCount > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    isActive ? "bg-blue-100 text-blue-600" : "bg-red-500 text-white"
                  }`}
                >
                  {incidentCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-blue-500/30">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 w-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
