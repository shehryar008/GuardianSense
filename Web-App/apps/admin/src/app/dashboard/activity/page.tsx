"use client"

import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { Card } from "../../../../components/ui/card"

const activities = [
  {
    title: "New incident reported",
    category: "Incident",
    actor: "System",
    time: "2 min ago",
    color: "bg-red-500",
  },
  {
    title: "Patient admitted to ICU",
    category: "Medical",
    actor: "Dr. Chen",
    time: "5 min ago",
    color: "bg-red-500",
  },
  {
    title: "Shift change completed",
    category: "Personnel",
    actor: "Admin",
    time: "15 min ago",
    color: "bg-purple-500",
  },
  {
    title: "Monthly report generated",
    category: "Report",
    actor: "System",
    time: "23 min ago",
    color: "bg-purple-500",
  },
  {
    title: "Case closed - resolved",
    category: "Incident",
    actor: "Officer Johnson",
    time: "34 min ago",
    color: "bg-green-500",
  },
  {
    title: "Emergency ambulance dispatched",
    category: "Medical",
    actor: "Dispatch",
    time: "42 min ago",
    color: "bg-red-500",
  },
  {
    title: "Database backup completed",
    category: "System",
    actor: "System",
    time: "1 hour ago",
    color: "bg-purple-500",
  },
  {
    title: "User login: admin@guardiansense.com",
    category: "Security",
    actor: "Admin",
    time: "1 hour ago",
    color: "bg-purple-500",
  },
]

export default function ActivityLogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Activity Log</h1>
            <p className="text-gray-500 text-sm">System and user activity tracking</p>
          </div>

          {/* Recent Activities */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`} />
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {activity.category} • <span className="text-gray-400">{activity.actor}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
