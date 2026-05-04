"use client"

import { useState } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { useAuth } from "../../../../components/auth/auth-provider"
import {
  BellIcon,
  LockIcon,
  SettingsIcon,
} from "../../../../components/shared/icons"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-gray-300"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
)

export default function SettingsPage() {
  const { station, token } = useAuth()

  const [notifications, setNotifications] = useState({
    emergencyAlerts: true,
    dispatchAlerts: true,
    emailNotifications: false,
  })

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState("")
  const [isChangingPw, setIsChangingPw] = useState(false)

  const handlePasswordChange = async () => {
    setPwError("")
    setPwSuccess("")

    if (!newPassword || !currentPassword) {
      setPwError("Please fill in all password fields.")
      return
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.")
      return
    }

    setIsChangingPw(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: station?.email,
          currentPassword,
          newPassword,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setPwError(data.message || "Failed to change password.")
        return
      }
      setPwSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setPwError("Unable to connect to server.")
    } finally {
      setIsChangingPw(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6 overflow-y-auto">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage notifications and account security</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Notification Preferences */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BellIcon className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Emergency Alerts</p>
                    <p className="text-sm text-gray-500">Receive notifications for critical incidents</p>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.emergencyAlerts}
                    onChange={() =>
                      setNotifications({ ...notifications, emergencyAlerts: !notifications.emergencyAlerts })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Dispatch Alerts</p>
                    <p className="text-sm text-gray-500">Notifications when units are dispatched</p>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.dispatchAlerts}
                    onChange={() =>
                      setNotifications({ ...notifications, dispatchAlerts: !notifications.dispatchAlerts })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email summaries of daily activities</p>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.emailNotifications}
                    onChange={() =>
                      setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <LockIcon className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Change Password</h2>
              </div>

              {pwError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{pwError}</div>
              )}
              {pwSuccess && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">{pwSuccess}</div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPw}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isChangingPw ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
