"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  token: string | null
  hospital: Record<string, unknown> | null
  isAuthenticated: boolean
  login: (token: string, refreshToken: string, hospital: Record<string, unknown> | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  hospital: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

// Pages that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [hospital, setHospital] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("token")
    const storedHospital = localStorage.getItem("hospital")

    if (storedToken) {
      setToken(storedToken)
      if (storedHospital) {
        try {
          setHospital(JSON.parse(storedHospital))
        } catch {
          setHospital(null)
        }
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    if (!token && !isPublicRoute) {
      // Not logged in and trying to access a protected route → redirect to login
      router.replace("/login")
    } else if (token && isPublicRoute) {
      // Already logged in and on login/register page → redirect to dashboard
      router.replace("/dashboard")
    }
  }, [token, pathname, isLoading, router])

  const login = (newToken: string, refreshToken: string, hospitalData: Record<string, unknown> | null) => {
    // Update localStorage
    localStorage.setItem("token", newToken)
    localStorage.setItem("refresh_token", refreshToken)
    if (hospitalData) {
      localStorage.setItem("hospital", JSON.stringify(hospitalData))
    }
    // Update React state — this triggers the useEffect to redirect to dashboard
    setToken(newToken)
    setHospital(hospitalData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("hospital")
    setToken(null)
    setHospital(null)
    router.replace("/login")
  }

  // Show nothing while checking auth (prevents flash of protected content)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // On protected routes without token, show nothing (will redirect)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  if (!token && !isPublicRoute) {
    return null
  }

  return (
    <AuthContext.Provider value={{ token, hospital, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
