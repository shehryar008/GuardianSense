"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon } from "../shared/icons"
import { useAuth } from "../shared/auth-context"
import { loginAdmin } from "../../src/lib/api"


export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await loginAdmin(email, password)

      if (!response.success || !response.data) {
        setError(response.message || "Login failed. Please check your credentials.")
        return
      }

      login(response.data.admin, response.data.token)
      router.push("/dashboard")
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
      {/* Card Header */}
      <div className="text-center pt-6 pb-4 px-6">
        <h2 className="text-xl font-semibold text-gray-900">Secure Login</h2>
        <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the admin dashboard</p>
      </div>

      {/* Card Content */}
      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="admin@guardiansense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-violet-50/70 border border-violet-100 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 h-11 bg-violet-50/70 border border-violet-100 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Submit Button - Purple gradient */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-medium rounded-lg shadow-lg shadow-violet-300/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 mt-4">
            <div className="flex gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-violet-700">Two-Factor Authentication Enabled</p>
                <p className="text-xs text-violet-600 mt-0.5">
                  Your account is protected with 2FA. You'll need to enter a verification code after login.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
