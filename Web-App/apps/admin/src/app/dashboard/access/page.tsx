"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { SearchIcon, PlusIcon, ShieldIcon } from "../../../../components/shared/icons"
import { fetchHospitals, fetchPoliceStations, toggleHospitalStatus, togglePoliceStationStatus, Hospital, PoliceStation } from "../../../../src/lib/api"

export default function AccessManagementPage() {
  const [facilities, setFacilities] = useState<{ id: string; name: string; type: string; role: string; email: string; isActive: boolean; rawId: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [hospRes, polRes] = await Promise.all([fetchHospitals(), fetchPoliceStations()])
      
      const combined = []
      
      if (hospRes.success && hospRes.data) {
        combined.push(...hospRes.data.map((h: Hospital) => ({
          id: `H-${h.hospital_id}`,
          rawId: h.hospital_id,
          name: h.hospital_name,
          type: "Hospital",
          role: "Medical Responder",
          email: h.email,
          isActive: h.is_active
        })))
      }
      
      if (polRes.success && polRes.data) {
        combined.push(...polRes.data.map((p: PoliceStation) => ({
          id: `PS-${p.station_id}`,
          rawId: p.station_id,
          name: p.station_name,
          type: "Police Station",
          role: "Police Responder",
          email: p.email,
          isActive: p.is_active
        })))
      }
      
      setFacilities(combined)
    } catch (err) {
      console.error("Failed to load access data", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleAccess = async (rawId: number, type: string) => {
    try {
      if (type === "Hospital") {
        await toggleHospitalStatus(rawId)
      } else {
        await togglePoliceStationStatus(rawId)
      }
      loadData()
    } catch (err) {
      alert("Error toggling access")
    }
  }

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Access Management</h1>
              <p className="text-gray-500 text-sm">Manage API access and authentication for facilities</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">
              <PlusIcon className="w-4 h-4" />
              Provision New App Access
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="relative w-[300px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account ID</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity Details</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type / Role</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">Loading access data...</td>
                    </tr>
                  ) : filteredFacilities.length > 0 ? (
                    filteredFacilities.map((facility) => (
                      <tr key={facility.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-600">
                            <ShieldIcon className="w-3 h-3" />
                            {facility.id}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <div className="font-medium text-gray-900">{facility.name}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{facility.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${
                            facility.type === "Hospital" 
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {facility.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            facility.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${facility.isActive ? "bg-green-500" : "bg-red-500"}`} />
                            {facility.isActive ? "Active" : "Revoked"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => handleToggleAccess(facility.rawId, facility.type)}
                            className={`text-sm font-medium ${
                              facility.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {facility.isActive ? "Revoke Access" : "Restore Access"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                        No facilities found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
