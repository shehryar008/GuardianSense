"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

const TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "police_token"
const STATION_KEY = process.env.NEXT_PUBLIC_STATION_KEY || "police_station"

interface PoliceStation {
  station_id: number
  station_name: string
  address: string
  city: string
  phone: string
  email: string
  is_active: boolean
}

interface AuthContextType {
  token: string | null
  station: PoliceStation | null
  isAuthenticated: boolean
  login: (token: string, station: PoliceStation) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  station: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [station, setStation] = useState<PoliceStation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for saved auth state on mount
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedStation = localStorage.getItem(STATION_KEY)

    if (savedToken && savedStation) {
      try {
        setToken(savedToken)
        setStation(JSON.parse(savedStation))
      } catch (e) {
        console.error("Failed to parse station data from localStorage", e)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(STATION_KEY)
      }
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return

    const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname === "/"

    if (!token && !isAuthRoute) {
      router.push("/login")
    } else if (token && (pathname === "/login" || pathname === "/")) {
      router.push("/dashboard")
    }
  }, [token, pathname, router, isLoading])

  const login = (newToken: string, newStation: PoliceStation) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(STATION_KEY, JSON.stringify(newStation))
    setToken(newToken)
    setStation(newStation)
    router.push("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(STATION_KEY)
    setToken(null)
    setStation(null)
    router.push("/login")
  }

  // Prevent flash of protected content while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ token, station, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
