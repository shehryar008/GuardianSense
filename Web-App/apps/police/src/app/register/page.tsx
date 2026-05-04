"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface FormData {
  station_name: string
  address: string
  city: string
  phone: string
  email: string
  password: string
  confirm_password: string
}

export default function PoliceRegistrationPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState<FormData>({
    station_name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleSubmit = async () => {
    setError("")
    setSuccess("")

    // Client-side validation
    if (!form.station_name || !form.address || !form.city || !form.phone || !form.email || !form.password) {
      setError("All fields marked with * are required.")
      return
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Create the police station record
      const stationRes = await fetch(`${API_URL}/api/police`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          station_name: form.station_name,
          address: form.address,
          city: form.city,
          phone: form.phone,
          email: form.email,
          password: form.password, // Ignored by backend DB insertion, but safe to pass
        }),
      })

      const stationData = await stationRes.json()

      if (!stationRes.ok || !stationData.success) {
        setError(stationData.message || "Failed to register police station.")
        return
      }

      // Step 2: Create auth account with the same email & password
      const authRes = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })

      const authData = await authRes.json()

      if (!authRes.ok || !authData.success) {
        // Rollback: delete the station record since auth failed
        try {
          await fetch(`${API_URL}/api/police/${stationData.data.station_id}`, {
            method: "DELETE",
          })
        } catch {
          // Rollback failed — log but don't mask the original error
          console.error("Failed to rollback police station record after auth failure")
        }
        setError(authData.message || "Registration failed. Please try again.")
        return
      }

      setSuccess("Police Station registered successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch {
      setError("Unable to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back to Login */}
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Login
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            {/* Reusing HeartIcon, ideally should be a Shield icon */}
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-600">GuardianSense</h1>
            <p className="text-sm text-gray-500">Police Department Portal</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Station Registration</h2>
        <p className="text-gray-500 mb-8">
          Complete the form below to register your police station with GuardianSense network
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
          {/* Station Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Station Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Station Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  id="station_name"
                  placeholder="Enter station name"
                  value={form.station_name}
                  onChange={handleChange("station_name")}
                />
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  id="email"
                  placeholder="contact@police.com"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone Number *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={form.phone}
                  onChange={handleChange("phone")}
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Address</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Street Address *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  id="address"
                  placeholder="1234 Precinct Ave"
                  value={form.address}
                  onChange={handleChange("address")}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">City *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  id="city"
                  placeholder="New York"
                  value={form.city}
                  onChange={handleChange("city")}
                />
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Account Security</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password *</label>
                <input
                  className="w-full px-3 py-2 border rounded-md"
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange("password")}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Confirm Password *</label>
                <input
                  className="w-full px-3 py-2 border rounded-md"
                  id="confirm_password"
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirm_password}
                  onChange={handleChange("confirm_password")}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Terms and Submit */}
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I certify that all information provided is accurate and I have the authority to register this station. I
              agree to the{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                GuardianSense Terms of Service
              </Link>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="px-8 py-2 border rounded-md hover:bg-gray-50">
              Cancel
            </Link>
            <button
              disabled={!agreed || isLoading}
              onClick={handleSubmit}
              className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
