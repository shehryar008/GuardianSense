"use client"

import {
  HeartIcon,
  LayoutDashboardIcon,
  AlertTriangleIcon,
  AmbulanceIcon,
  HistoryIcon,
  UserIcon,
  SettingsIcon,
} from "../shared/icons"
import Link from "next/link"
import { useAuth } from "../auth/auth-provider"
import { useEffect, useState } from "react"

interface SidebarProps {
  activeItem?: string
}

export function Sidebar({ activeItem = "Dashboard" }: SidebarProps) {
  const { logout, hospital, token } = useAuth()
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    if (!hospital?.hospital_id || !token) return
    const fetchActiveDispatches = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/hospitals/${hospital.hospital_id}/dispatches`
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) {
          const count = data.data.filter((d: any) => d.dispatch_status === "Pending" || d.dispatch_status === "En Route").length
          setActiveCount(count)
        }
      } catch (e) {}
    }
    fetchActiveDispatches()
  }, [hospital?.hospital_id, token])

  const navItems = [
    { icon: LayoutDashboardIcon, label: "Dashboard", href: "/dashboard" },
    { icon: AlertTriangleIcon, label: "Active Incidents", badge: activeCount, href: "/active-incidents" },
    { icon: AmbulanceIcon, label: "Ambulance Fleet", href: "/ambulance-fleet" },
    { icon: HistoryIcon, label: "Incident History", href: "/incident-history" },
    { icon: UserIcon, label: "Profile", href: "/profile" },
    { icon: SettingsIcon, label: "Settings", href: "/settings" },
  ]

  return (
    <aside className="sticky top-0 h-screen flex-shrink-0 overflow-y-auto w-64 bg-gradient-to-b from-teal-600 to-teal-700 p-4 flex flex-col">
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
              {item.badge !== undefined && item.badge > 0 && (
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

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all mt-auto shadow-md font-medium"
      >
        <LogOutIcon className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </aside>
  )
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
