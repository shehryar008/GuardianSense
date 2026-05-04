"use client"

import { useState } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { useAuth } from "../../../../components/auth/auth-provider"
import {
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  EditIcon,
  SaveIcon,
} from "../../../../components/shared/icons"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ProfilePage() {
  const { station, token } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    station_name: station?.station_name || "",
    address: station?.address || "",
    city: station?.city || "",
    phone: station?.phone || "",
    email: station?.email || "",
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    if (!token || !station) return
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`${API_URL}/api/police/${station.station_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || "Failed to update profile.")
        return
      }
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
    } catch {
      setError("Unable to connect to server.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6 overflow-y-auto">
          {/* Station Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                  <BuildingIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{station?.station_name || "Police Station"}</h1>
                  <p className="text-sm text-gray-500">Station ID: {station?.station_id}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MailIcon className="w-4 h-4" />
                      <span>{station?.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{station?.phone || "—"}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${station?.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {station?.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <EditIcon className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit Station Info"}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">{success}</div>
          )}

          {/* Station Information Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Station Information</h2>
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <SaveIcon className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Station Name</label>
                <input
                  type="text"
                  value={form.station_name}
                  onChange={handleChange("station_name")}
                  readOnly={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${isEditing ? "text-gray-900" : "text-gray-400 bg-gray-50"}`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Station ID</label>
                <input
                  type="text"
                  value={station?.station_id?.toString() || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  readOnly={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${isEditing ? "text-gray-900" : "text-gray-400 bg-gray-50"}`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  readOnly={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${isEditing ? "text-gray-900" : "text-gray-400 bg-gray-50"}`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={handleChange("city")}
                  readOnly={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${isEditing ? "text-gray-900" : "text-gray-400 bg-gray-50"}`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <input
                  type="text"
                  value={station?.is_active ? "Active" : "Inactive"}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 bg-gray-50"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={handleChange("address")}
                  readOnly={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${isEditing ? "text-gray-900" : "text-gray-400 bg-gray-50"}`}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
