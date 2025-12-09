"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? "bg-teal-500" : "bg-gray-200"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? "left-7" : "left-1"}`}
      />
    </button>
  )
}

function SettingRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string
  description: string
  enabled: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} />
    </div>
  )
}

function SettingButton({ title, description }: { title: string; description: string }) {
  return (
    <button className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="text-left">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

function SectionCard({
  icon,
  iconBgColor,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  iconBgColor: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Settings" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-500">Manage your application preferences and security settings</p>
          </div>

          <div className="max-w-3xl space-y-6">
            {/* Notifications */}
            <SectionCard
              icon={
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              }
              iconBgColor="bg-teal-100"
              title="Notifications"
              description="Manage how you receive alerts and updates"
            >
              <div className="divide-y divide-gray-100">
                <SettingRow
                  title="Email Notifications"
                  description="Receive incident alerts via email"
                  enabled={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
                <SettingRow
                  title="Push Notifications"
                  description="Get real-time alerts on your device"
                  enabled={pushNotifications}
                  onChange={() => setPushNotifications(!pushNotifications)}
                />
                <SettingRow
                  title="SMS Notifications"
                  description="Receive critical alerts via text message"
                  enabled={smsNotifications}
                  onChange={() => setSmsNotifications(!smsNotifications)}
                />
              </div>
            </SectionCard>

            {/* Appearance */}
            <SectionCard
              icon={
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              }
              iconBgColor="bg-purple-100"
              title="Appearance"
              description="Customize the look and feel of the application"
            >
              <SettingRow
                title="Dark Mode"
                description="Switch to dark theme"
                enabled={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </SectionCard>

            {/* Security */}
            <SectionCard
              icon={
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              iconBgColor="bg-red-100"
              title="Security"
              description="Manage your account security settings"
            >
              <div className="space-y-3">
                <SettingButton title="Change Password" description="Update your account password" />
                <SettingButton title="Two-Factor Authentication" description="Add an extra layer of security" />
                <SettingButton title="Active Sessions" description="Manage your logged-in devices" />
              </div>
            </SectionCard>

            {/* Regional Settings */}
            <SectionCard
              icon={
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              iconBgColor="bg-teal-100"
              title="Regional Settings"
              description="Configure language and timezone preferences"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Language</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Timezone</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Eastern Time (ET)</option>
                    <option>Pacific Time (PT)</option>
                    <option>Central Time (CT)</option>
                  </select>
                </div>
              </div>
            </SectionCard>
          </div>
        </main>
      </div>
    </div>
  )
}
