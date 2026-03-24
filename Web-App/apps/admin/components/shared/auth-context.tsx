"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AdminUser {
  admin_id: number
  name: string
  email: string
  phone: string
}

interface AuthContextType {
  admin: AdminUser | null
  token: string | null
  isLoading: boolean
  login: (admin: AdminUser, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Load auth from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token")
    const storedAdmin = localStorage.getItem("admin_user")

    if (storedToken && storedAdmin) {
      try {
        setToken(storedToken)
        setAdmin(JSON.parse(storedAdmin))
      } catch {
        localStorage.removeItem("admin_token")
        localStorage.removeItem("admin_user")
      }
    }
    setIsLoading(false)
  }, [])

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return

    const isLoginPage = pathname === "/login" || pathname === "/"
    if (!token && !isLoginPage) {
      router.push("/login")
    }
    if (token && isLoginPage) {
      router.push("/dashboard")
    }
  }, [token, pathname, isLoading, router])

  const login = useCallback((adminData: AdminUser, tokenValue: string) => {
    localStorage.setItem("admin_token", tokenValue)
    localStorage.setItem("admin_user", JSON.stringify(adminData))
    setAdmin(adminData)
    setToken(tokenValue)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    setAdmin(null)
    setToken(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
