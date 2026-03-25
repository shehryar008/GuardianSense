"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { HeartIcon } from "../../../components/shared/icons"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Checkbox } from "../../../components/ui/checkbox"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

interface FormData {
  hospital_name: string
  address: string
  city: string
  phone: string
  email: string
  bed_capacity: string
  password: string
  confirm_password: string
}

export default function HospitalRegistrationPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState<FormData>({
    hospital_name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    bed_capacity: "",
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
    if (!form.hospital_name || !form.address || !form.city || !form.phone || !form.email || !form.bed_capacity || !form.password) {
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

    const bedCapacity = parseInt(form.bed_capacity, 10)
    if (isNaN(bedCapacity) || bedCapacity < 1) {
      setError("Bed capacity must be a positive number.")
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Create the hospital record
      const hospitalRes = await fetch(`${API_URL}/api/hospitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital_name: form.hospital_name,
          address: form.address,
          city: form.city,
          phone: form.phone,
          email: form.email,
          bed_capacity: bedCapacity,
          password: form.password,
        }),
      })

      const hospitalData = await hospitalRes.json()

      if (!hospitalRes.ok || !hospitalData.success) {
        setError(hospitalData.message || "Failed to register hospital.")
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
        // Hospital was created but auth failed — still show partial success
        setError(authData.message || "Hospital registered, but account creation failed. Contact admin.")
        return
      }

      setSuccess("Hospital registered successfully! Your account is pending admin approval. Redirecting to login...")
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
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
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
            <HeartIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-teal-500">GuardianSense</h1>
            <p className="text-sm text-gray-500">Medical Center Network</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Hospital Registration</h2>
        <p className="text-gray-500 mb-8">
          Complete the form below to register your hospital with GuardianSense network
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
          {/* Hospital Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Hospital Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hospital Name *</label>
                <Input
                  id="hospital_name"
                  placeholder="Enter hospital name"
                  value={form.hospital_name}
                  onChange={handleChange("hospital_name")}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bed Capacity *</label>
                <Input
                  id="bed_capacity"
                  type="number"
                  min="1"
                  placeholder="e.g., 500"
                  value={form.bed_capacity}
                  onChange={handleChange("bed_capacity")}
                />
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address *</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@hospital.com"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone Number *</label>
                <Input
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Address</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Street Address *</label>
                <Input
                  id="address"
                  placeholder="1234 Medical Plaza"
                  value={form.address}
                  onChange={handleChange("address")}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">City *</label>
                <Input
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Account Security</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password *</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange("password")}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Confirm Password *</label>
                <Input
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
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I certify that all information provided is accurate and I have the authority to register this hospital. I
              agree to the{" "}
              <Link href="#" className="text-teal-600 hover:underline">
                GuardianSense Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-teal-600 hover:underline">
                HIPAA compliance requirements
              </Link>
              .
            </label>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="px-8 bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button
              disabled={!agreed || isLoading}
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Registration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}