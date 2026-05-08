"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "../shared/icons"
import { useAuth } from "../shared/auth-context"
import { fetchHospitals, fetchPoliceStations, fetchIncidents } from "../../src/lib/api"

interface SearchResult {
  type: "hospital" | "police" | "incident"
  label: string
  detail: string
  href: string
}

export function Header() {
  const { admin, logout } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const adminName = admin?.name || "Admin"
  const initials = adminName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      const q = value.toLowerCase()
      const searchResults: SearchResult[] = []

      try {
        const [hospRes, polRes, incRes] = await Promise.all([
          fetchHospitals(),
          fetchPoliceStations(),
          fetchIncidents(),
        ])

        if (hospRes.success && hospRes.data) {
          hospRes.data
            .filter(h => h.hospital_name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q))
            .forEach(h => searchResults.push({
              type: "hospital",
              label: h.hospital_name,
              detail: `${h.city} · ${h.bed_capacity} beds · ${h.is_active ? "Active" : "Inactive"}`,
              href: "/dashboard/hospital",
            }))
        }

        if (polRes.success && polRes.data) {
          polRes.data
            .filter(s => s.station_name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q))
            .forEach(s => searchResults.push({
              type: "police",
              label: s.station_name,
              detail: `${s.city} · ${s.is_active ? "Active" : "Inactive"}`,
              href: "/dashboard/police",
            }))
        }

        if (incRes.success && incRes.data) {
          incRes.data
            .filter(i => String(i.incident_id).includes(q) || `inc-${i.incident_id}`.includes(q))
            .slice(0, 5)
            .forEach(i => searchResults.push({
              type: "incident",
              label: `Incident #${i.incident_id}`,
              detail: `${i.is_active ? "Active" : "Resolved"} · ${new Date(i.detected_at).toLocaleDateString()}`,
              href: "/dashboard/reports",
            }))
        }
      } catch { /* silently fail */ }

      setResults(searchResults)
      setIsOpen(searchResults.length > 0)
      setIsSearching(false)
    }, 300)
  }

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    setQuery("")
    router.push(result.href)
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "hospital": return "bg-blue-100 text-blue-700"
      case "police": return "bg-amber-100 text-amber-700"
      case "incident": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      {/* Search Bar with Dropdown */}
      <div className="relative w-[360px]" ref={wrapperRef}>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search hospitals, stations, incidents..."
          className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[320px] overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
              >
                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${getTypeBadge(r.type)}`}>
                  {r.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.label}</p>
                  <p className="text-xs text-gray-500 truncate">{r.detail}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {isSearching && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-sm text-gray-500">
            Searching...
          </div>
        )}
      </div>

      {/* Admin Profile + Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 pl-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{adminName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="ml-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
