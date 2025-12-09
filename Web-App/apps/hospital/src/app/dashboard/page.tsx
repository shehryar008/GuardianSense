import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { StatCard } from "../../../components/dashboard/stat-card"
import { IncidentCard } from "../../../components/dashboard/incident-card"
import { CriticalAlert } from "../../../components/dashboard/critical-alert"
import { AlertTriangleIcon, ClockIcon, ActivityIcon, UsersIcon } from "../../../components/shared/icons"

export default function HospitalDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeItem="Dashboard" />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6">
          {/* Critical Alert */}
          <CriticalAlert message="Major vehicle accident detected at Highway 9A Main Rd - Multiple casualties" />

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <StatCard
              icon={<AlertTriangleIcon className="w-6 h-6 text-red-500" />}
              iconBgColor="bg-red-100"
              value="12"
              label="Incidents"
              subtext="+4 from last hour"
              subtextColor="text-red-500"
            />
            <StatCard
              icon={<ClockIcon className="w-6 h-6 text-blue-500" />}
              iconBgColor="bg-blue-100"
              value="24"
              label="Response"
              subtext="8k available"
              subtextColor="text-blue-500"
            />
            <StatCard
              icon={<ActivityIcon className="w-6 h-6 text-amber-500" />}
              iconBgColor="bg-amber-100"
              value="4.2"
              label="Avg Time"
              subtext="mins"
              subtextColor="text-amber-500"
            />
            <StatCard
              icon={<UsersIcon className="w-6 h-6 text-teal-500" />}
              iconBgColor="bg-teal-100"
              value="156"
              label="Staff"
              subtext="44k requests"
              subtextColor="text-teal-500"
            />
          </div>

          {/* Live Incident Feed */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Live Incident Feed</h2>
              <span className="flex items-center gap-1.5 text-sm text-teal-500">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                Live Updates
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <IncidentCard
                priority="CRITICAL"
                title="Vehicle Collision"
                description="Major vehicle accident detected on Highway 9A Main Rd - Multiple casualties"
                location="E 27TH ST, 1st-10th - NY 2.2k dispatched"
                time="5 min ago"
              />
              <IncidentCard
                priority="CRITICAL"
                title="Vehicle Collision"
                description="Major vehicle accident detected on Highway 9A Main Rd - Multiple casualties"
                location="E 27TH ST, 1st-10th - NY 2.2k dispatched"
                time="5 min ago"
              />
              <IncidentCard
                priority="MEDIUM"
                title="Cardiac Emergency Detected"
                description="Dispatch ambulance to location nearby"
                location="E Main West Road, CA 5.2k to made"
                time="12 min ago"
              />
              <IncidentCard
                priority="MEDIUM"
                title="Cardiac Emergency Detected"
                description="Dispatch ambulance to location nearby"
                location="E Main West Road, CA 5.2k to made"
                time="12 min ago"
              />
              <IncidentCard
                priority="LOW"
                title="Fire Hazard Alert"
                description="Fire hazard detected at a residential address. We team is going check nearby."
                location="W 6TH ST, 3rd-20th - CA 2.2k dispatched"
                time="15 min ago"
              />
              <IncidentCard
                priority="LOW"
                title="Fire Hazard Alert"
                description="Fire hazard detected at a residential address. We team is going check nearby."
                location="W 6TH ST, 3rd-20th - CA 2.2k dispatched"
                time="15 min ago"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
