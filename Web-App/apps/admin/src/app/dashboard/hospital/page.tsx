"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { SearchIcon, FilterIcon, DownloadIcon } from "../../../../components/shared/icons"
import { fetchHospitals, Hospital, toggleHospitalStatus } from "../../../lib/api"

export default function HospitalDataPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setIsLoading(true)
      const res = await fetchHospitals()
      if (res.success && res.data) {
        setHospitals(res.data)
      } else {
        setError(res.message || "Failed to fetch hospitals")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await toggleHospitalStatus(id)
      if (res.success) {
        // Refresh data
        loadData()
      } else {
        alert(res.message)
      }
    } catch (err) {
      alert("Error toggling status")
    }
  }

  const filteredHospitals = hospitals.filter(h => 
    h.hospital_name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase()) ||
    h.email.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-600 border border-green-200" 
      : "bg-red-100 text-red-600 border border-red-200"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Hospital Data Management</h1>
            <p className="text-gray-500 text-sm">Detailed data and facility management</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Data Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Search and Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-[300px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hospitals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={loadData}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">
                  <DownloadIcon className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading && hospitals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Loading hospitals...</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">City</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Beds</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHospitals.map((hospital) => (
                      <tr key={hospital.hospital_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-violet-600 font-medium">H-{hospital.hospital_id}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{hospital.hospital_name}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{hospital.city}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div>{hospital.phone}</div>
                          <div className="text-xs text-gray-400">{hospital.email}</div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{hospital.bed_capacity}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(hospital.is_active)}`}>
                            {hospital.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button 
                            onClick={() => handleToggleStatus(hospital.hospital_id)}
                            className={`text-sm font-medium ${hospital.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          >
                            {hospital.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredHospitals.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-500">No hospitals found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
