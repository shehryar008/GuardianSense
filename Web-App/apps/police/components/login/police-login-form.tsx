"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, KeyIcon, UsersIcon } from "../shared/icons"

export function PoliceLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Police Staff Login</h2>
        <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the medical center</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Employee ID Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter your employee ID"
              className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-12 py-3 bg-blue-50/50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          Sign In
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
        </div>

        {/* Request Access */}
        <div className="text-center">
          <a href="#" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <UsersIcon className="h-4 w-4" />
            First time user? Request access
          </a>
        </div>
      </form>

      {/* HIPAA Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <KeyIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-600">HIPAA Compliant Access</p>
            <p className="text-xs text-blue-500 mt-1">All access attempts are logged for security and compliance.</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-gray-400 mt-6">For authorized medical personnel only • HIPAA compliant</p>
    </div>
  )
}
