"use client"

import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import {
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  TrophyIcon,
  UsersIcon,
  CheckCircleIcon,
  EditIcon,
  SaveIcon,
} from "../../../../components/shared/icons"

const stationStats = [
  { value: "156", label: "Active Officers", color: "text-blue-600" },
  { value: "24", label: "Patrol Units", color: "text-green-600" },
  { value: "847", label: "Cases This Month", color: "text-orange-500" },
  { value: "4.2 min", label: "Avg Response", color: "text-blue-600" },
]

const achievements = [
  { title: "Station of Excellence Award", year: "2024", icon: TrophyIcon },
  { title: "Community Safety Achievement", year: "2023", icon: TrophyIcon },
  { title: "Best Response Time Award", year: "2023", icon: TrophyIcon },
  { title: "Distinguished Service Medal", year: "2022", icon: TrophyIcon },
]

const recentActivity = [
  { title: "Emergency response completed", time: "2 hours ago", icon: CheckCircleIcon },
  { title: "Monthly safety inspection passed", time: "1 day ago", icon: CheckCircleIcon },
  { title: "Community outreach event held", time: "2 days ago", icon: UsersIcon },
  { title: "Equipment maintenance completed", time: "3 days ago", icon: CheckCircleIcon },
  { title: "Staff training session conducted", time: "5 days ago", icon: UsersIcon },
]

const departments = [
  {
    name: "Criminal Investigation Division",
    commander: "Cpt. Chief",
    role: "Detective",
    officers: 42,
    color: "bg-blue-500",
  },
  { name: "Patrol Division", commander: "Captain", role: "Supervisor", officers: 68, color: "bg-green-500" },
  { name: "Traffic Division", commander: "Lt.", role: "Jefferson", officers: 24, color: "bg-yellow-500" },
  { name: "Community Relations", commander: "Sgt.", role: "Chen", officers: 12, color: "bg-purple-500" },
  { name: "Special Operations", commander: "Lt.", role: "Anderson", officers: 10, color: "bg-red-500" },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6 overflow-y-auto">
          {/* Station Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                  <BuildingIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Downtown Central Precinct</h1>
                  <p className="text-sm text-gray-500">Metropolitan Police Department • PRECINCT-001</p>
                  <p className="text-sm text-gray-500">Central District - Manhattan</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MailIcon className="w-4 h-4" />
                      <span>downtown.central@guardiansense.gov</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <PhoneIcon className="w-4 h-4" />
                      <span>+1 (555) 867-6543</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1 text-red-600">
                      <PhoneIcon className="w-4 h-4" />
                      <span>Emergency Line: 911</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>In Operation: 72 years</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <EditIcon className="w-4 h-4" />
                Edit Station Info
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stationStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Achievements & Activity */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Achievements */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                <h2 className="font-semibold text-gray-900">Station Achievements & Awards</h2>
              </div>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <achievement.icon className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-xs text-gray-500">{achievement.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-gray-900">Recent Station Activity</h2>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <activity.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Station Departments */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Station Departments</h2>
            </div>
            <div className="space-y-3">
              {departments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${dept.color} rounded-lg flex items-center justify-center`}>
                      <UsersIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dept.name}</p>
                      <p className="text-sm text-gray-500">
                        Commander: {dept.commander} {dept.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{dept.officers}</p>
                      <p className="text-xs text-gray-500">Officers</p>
                    </div>
                    <button className="text-blue-600 text-sm hover:underline">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Station Information Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Station Information</h2>
              <button className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
                <SaveIcon className="w-4 h-4" />
                Save Changes
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Station Name</label>
                <input
                  type="text"
                  defaultValue="Downtown Central Precinct"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Station ID</label>
                <input
                  type="text"
                  defaultValue="PRECINCT-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Station Type</label>
                <input
                  type="text"
                  defaultValue=""
                  placeholder="Enter station type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Established Date</label>
                <input
                  type="text"
                  defaultValue="March 12, 1952"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Main Phone Line</label>
                <input
                  type="text"
                  defaultValue="+1 (555) 867-6543"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Emergency Line</label>
                <input
                  type="text"
                  defaultValue="911"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Contact Email</label>
                <input
                  type="email"
                  defaultValue="downtown.central@guardiansense.gov"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Jurisdiction</label>
                <input
                  type="text"
                  defaultValue="Central District - Manhattan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Physical Address</label>
                <input
                  type="text"
                  defaultValue="350 Park Avenue South, New York, NY 10016"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
