"use client"

import Link from "next/link"
import { useState } from "react"
import { HeartIcon } from "../../../components/shared/icons"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Checkbox } from "../../../components/ui/checkbox"

export default function HospitalRegistrationPage() {
  const [agreed, setAgreed] = useState(false)

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
                <Input placeholder="Enter hospital name" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hospital Type *</label>
                <Input placeholder="" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">License Number *</label>
                <Input placeholder="MC-XXXX-XXXXXXX" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year Established</label>
                <Input placeholder="e.g., 1985" />
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
                <Input placeholder="contact@hospital.com" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone Number *</label>
                <Input placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Emergency Line</label>
                <Input placeholder="+1 (800) 911-HELP" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Website</label>
                <Input placeholder="https://www.hospital.com" />
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
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Address</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Street Address *</label>
                <Input placeholder="1234 Medical Plaza" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">City *</label>
                  <Input placeholder="New York" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">State/Province *</label>
                  <Input placeholder="NY" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ZIP/Postal Code *</label>
                  <Input placeholder="10001" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Country *</label>
                  <Input placeholder="" />
                </div>
              </div>
            </div>
          </section>

          {/* Facility Details */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Facility Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bed Capacity *</label>
                <Input placeholder="e.g., 500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Number of Departments *</label>
                <Input placeholder="e.g., 18" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ambulance Units *</label>
                <Input placeholder="e.g., 24" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Staff Count *</label>
                <Input placeholder="e.g., 850" />
              </div>
            </div>
          </section>

          {/* Administrator Details */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Administrator Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
                <Input placeholder="Dr. John Smith" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title/Position *</label>
                <Input placeholder="Chief Medical Officer" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email *</label>
                <Input placeholder="admin@hospital.com" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone *</label>
                <Input placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </section>

          {/* Certifications & Specializations */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Certifications & Specializations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Accreditations</label>
                <Input placeholder="e.g., Joint Commission" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Trauma Level</label>
                <Input placeholder="" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1">Specializations</label>
              <Input placeholder="e.g., Cardiology, Neurology, Pediatrics" />
            </div>
          </section>

          {/* Additional Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Additional Information</h3>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Additional Notes</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Any additional information about your hospital..."
              />
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
              disabled={!agreed}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white disabled:opacity-50"
            >
              Submit Registration
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}