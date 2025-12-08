"use client"

import { useState } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import {
  BellIcon,
  LockIcon,
  PaletteIcon,
  GlobeIcon,
  VolumeIcon,
  DatabaseIcon,
  SettingsIcon,
  CheckCircleIcon,
} from "../../../../components/shared/icons"

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
  const [notifications, setNotifications] = useState({
    emergencyAlerts: true,
    caseUpdates: true,
    unitDispatch: true,
    systemMaintenance: false,
    emailNotifications: true,
  })

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: true,
  })

  const [appearance, setAppearance] = useState({
    compactMode: false,
    animations: true,
    highContrast: false,
  })

  const [device, setDevice] = useState({
    soundEffects: true,
    vibration: true,
    autoRefresh: true,
  })

  const [selectedColor, setSelectedColor] = useState("blue")
  const colorOptions = [
    { id: "blue", color: "bg-blue-600" },
    { id: "darkblue", color: "bg-blue-900" },
    { id: "purple", color: "bg-purple-600" },
    { id: "pink", color: "bg-pink-500" },
    { id: "green", color: "bg-green-600" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6 overflow-y-auto">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
                  <p className="text-sm text-gray-500">Manage your application preferences and system configurations</p>
                </div>
              </div>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                <CheckCircleIcon className="w-4 h-4" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  key: "emergencyAlerts",
                  title: "Emergency Alerts",
                  desc: "Receive notifications for critical incidents",
                },
                { key: "caseUpdates", title: "Case Updates", desc: "Get notified when assigned cases are updated" },
                { key: "unitDispatch", title: "Unit Dispatch Alerts", desc: "Notifications when units are dispatched" },
                {
                  key: "systemMaintenance",
                  title: "System Maintenance",
                  desc: "Alerts for scheduled maintenance and updates",
                },
                {
                  key: "emailNotifications",
                  title: "Email Notifications",
                  desc: "Receive email summaries of daily activities",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <ToggleSwitch
                    enabled={notifications[item.key as keyof typeof notifications]}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key as keyof typeof notifications],
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Security & Privacy and Appearance */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Security & Privacy */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <LockIcon className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Security & Privacy</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Change Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                  />
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Update Password
                </button>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add extra security to your account</p>
                  </div>
                  <ToggleSwitch
                    enabled={security.twoFactor}
                    onChange={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Session Timeout</p>
                    <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <ToggleSwitch
                    enabled={security.sessionTimeout}
                    onChange={() => setSecurity({ ...security, sessionTimeout: !security.sessionTimeout })}
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <PaletteIcon className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Appearance</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Theme</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Color Scheme</label>
                  <div className="flex gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedColor(option.id)}
                        className={`w-10 h-10 rounded-lg ${option.color} ${selectedColor === option.id ? "ring-2 ring-offset-2 ring-blue-600" : ""}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium text-gray-900">Compact Mode</p>
                    <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                  </div>
                  <ToggleSwitch
                    enabled={appearance.compactMode}
                    onChange={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Animations</p>
                    <p className="text-sm text-gray-500">Enable smooth transitions</p>
                  </div>
                  <ToggleSwitch
                    enabled={appearance.animations}
                    onChange={() => setAppearance({ ...appearance, animations: !appearance.animations })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">High Contrast</p>
                    <p className="text-sm text-gray-500">Improve visibility</p>
                  </div>
                  <ToggleSwitch
                    enabled={appearance.highContrast}
                    onChange={() => setAppearance({ ...appearance, highContrast: !appearance.highContrast })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Regional & Language Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <GlobeIcon className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Regional & Language Settings</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Language</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Time Zone</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Pacific Time (PT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Device Settings and Data & Storage */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Device Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <VolumeIcon className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Device Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sound Effects</p>
                    <p className="text-sm text-gray-500">Play sounds for notifications</p>
                  </div>
                  <ToggleSwitch
                    enabled={device.soundEffects}
                    onChange={() => setDevice({ ...device, soundEffects: !device.soundEffects })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Vibration</p>
                    <p className="text-sm text-gray-500">Haptic feedback on mobile devices</p>
                  </div>
                  <ToggleSwitch
                    enabled={device.vibration}
                    onChange={() => setDevice({ ...device, vibration: !device.vibration })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Auto-Refresh</p>
                    <p className="text-sm text-gray-500">Automatically update dashboard data</p>
                  </div>
                  <ToggleSwitch
                    enabled={device.autoRefresh}
                    onChange={() => setDevice({ ...device, autoRefresh: !device.autoRefresh })}
                  />
                </div>
              </div>
            </div>

            {/* Data & Storage */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <DatabaseIcon className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Data & Storage</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Storage Used</span>
                    <span className="text-gray-900">3.2 GB / 10 GB</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="w-1/3 h-2 bg-blue-600 rounded-full" />
                  </div>
                </div>
                <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Clear Cache
                </button>
                <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Export All Data
                </button>
                <button className="w-full py-2 text-red-600 text-sm font-medium hover:underline">Delete Account</button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Reset to Defaults
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Save All Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
