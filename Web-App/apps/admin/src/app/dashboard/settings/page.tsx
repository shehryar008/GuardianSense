"use client"

import { useState } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { Card } from "../../../../components/ui/card"
import { Settings, Users, Check } from "lucide-react"

function PurpleSwitch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-purple-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-500 text-sm">System configuration and preferences</p>
          </div>

          {/* Settings Cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* General Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Auto-refresh Dashboard</p>
                    <p className="text-sm text-gray-500">Refresh every 30 seconds</p>
                  </div>
                  <PurpleSwitch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive critical alerts via email</p>
                  </div>
                  <PurpleSwitch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sound Alerts</p>
                    <p className="text-sm text-gray-500">Play sound for critical incidents</p>
                  </div>
                  <PurpleSwitch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
                </div>
              </div>
            </Card>

            {/* User Access Control */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">User Access Control</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="font-medium text-gray-900">Administrator Role</p>
                  <p className="text-sm text-gray-500 mb-2">Full system access and configuration rights</p>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-600">Current Role</span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="font-medium text-gray-900">Session Timeout</p>
                  <p className="text-sm text-gray-500">30 minutes of inactivity</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Enabled
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
