"use client"

import { useState } from "react"
import { SearchIcon, PlusIcon, DownloadIcon, BellIcon } from "../shared/icons"
import { useAuth } from "../auth/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export function Header() {
  const { hospital, token } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [incidentId, setIncidentId] = useState("")
  const [isDispatching, setIsDispatching] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!incidentId.trim()) return

    setError("")
    setSuccess("")
    setIsDispatching(true)

    try {
      const res = await fetch(`${API_URL}/api/hospitals/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          incident_id: Number(incidentId),
          hospital_id: hospital?.hospital_id
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess("Ambulance dispatched successfully!")
        setIncidentId("")
        // Close modal and refresh to show new dispatch
        setTimeout(() => {
          setIsModalOpen(false)
          setSuccess("")
          window.location.reload()
        }, 1500)
      } else {
        setError(data.message || "Failed to dispatch ambulance")
      }
    } catch (err) {
      setError("Network error occurred while dispatching")
    } finally {
      setIsDispatching(false)
    }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-xl">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search incident, ambulance, staff..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Manual Dispatch
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-700">
              <DownloadIcon className="w-4 h-4" />
              Export Data
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">DR</span>
            </div>
          </div>
        </div>
      </header>

      {/* Manual Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Manual Dispatch</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-6">
                Enter the Incident ID to manually dispatch an ambulance from your fleet to the emergency location.
              </p>

              <form onSubmit={handleDispatch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={incidentId}
                    onChange={(e) => setIncidentId(e.target.value)}
                    placeholder="e.g. 101"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium border border-teal-100 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{success}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDispatching || !incidentId}
                    className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center min-w-[120px] shadow-sm"
                  >
                    {isDispatching ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Dispatch Ambulance"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
