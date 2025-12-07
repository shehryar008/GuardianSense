"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon } from "../shared/icons"

export function HospitalLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Medical Staff Login</h2>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the medical center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your employee ID"
                className="w-full pl-10 pr-4 py-3 bg-teal-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 bg-teal-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-teal-500 hover:text-teal-600 font-medium">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <UsersIcon className="h-4 w-4" />
            <span>First time user?</span>
            <a href="#" className="text-teal-500 hover:text-teal-600 font-medium">
              Request access
            </a>
          </div>
        </div>

        <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="h-5 w-5 text-teal-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-teal-700">HIPAA Compliant Access</p>
              <p className="text-xs text-teal-600 mt-1">All access attempts are logged for security and compliance.</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">For authorized medical personnel only • HIPAA compliant</p>
    </div>
  )
}

function UsersIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
