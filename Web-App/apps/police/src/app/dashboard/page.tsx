import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { StatCard } from "../../../components/dashboard/stat-card"
import { IncidentCard } from "../../../components/dashboard/incident-card"
import { CriticalAlert } from "../../../components/dashboard/critical-alert"
import { AlertTriangleIcon, ClockIcon, ActivityIcon, UsersIcon } from "../../../components/shared/icons"

export default function PoliceDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-56">
        <Header />

        <main className="p-6">
          {/* Critical Alert */}
          <CriticalAlert message="Armed robbery in progress at Main Street convenience store - All available units respond" />

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <StatCard
              icon={<AlertTriangleIcon className="w-5 h-5 text-red-500" />}
              iconBgColor="bg-red-100"
              value="12"
              label="Incidents"
              subtext="+4 from last hour"
              subtextColor="text-green-500"
            />
            <StatCard
              icon={<ClockIcon className="w-5 h-5 text-blue-500" />}
              iconBgColor="bg-blue-100"
              value="24"
              label="Response"
              subtext="8k available"
              subtextColor="text-blue-500"
            />
            <StatCard
              icon={<ActivityIcon className="w-5 h-5 text-yellow-500" />}
              iconBgColor="bg-yellow-100"
              value="4.2"
              label="Avg Time"
              subtext="mins"
              subtextColor="text-green-500"
            />
            <StatCard
              icon={<UsersIcon className="w-5 h-5 text-purple-500" />}
              iconBgColor="bg-purple-100"
              value="156"
              label="Staff"
              subtext="44k requests"
              subtextColor="text-gray-500"
            />
          </div>

          {/* Live Incident Feed */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Live Incident Feed</h2>
              <span className="flex items-center gap-1 text-sm text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Updates
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <IncidentCard
                  priority="CRITICAL"
                  title="Armed Robbery in Progress"
                  description="Armed suspects at convenience store on Main Street - Officers requested backup immediately"
                  location="E 27TH ST, 1st-10th - NY 2.2k dispatched"
                  time="3 min ago"
                  status="dispatched"
                />
                <IncidentCard
                  priority="HIGH"
                  title="Domestic Disturbance"
                  description="Multiple 911 calls reporting loud argument and possible violence"
                  location="W Main Avenue, Apartment 4B - CA 5.2k to made"
                  time="8 min ago"
                  status="en-route"
                />
                <IncidentCard
                  priority="MEDIUM"
                  title="Suspicious Vehicle"
                  description="Vehicle matching description of recent burglary seen in residential area"
                  location="W 6TH ST, 3rd-20th - CA 3.4k dispatched"
                  time="12 min ago"
                  status="investigating"
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <IncidentCard
                  priority="CRITICAL"
                  title="Armed Robbery in Progress"
                  description="Armed suspects at convenience store on Main Street - Officers requested backup immediately"
                  location="E 27TH ST, 1st-10th - NY 2.2k dispatched"
                  time="3 min ago"
                  status="dispatched"
                />
                <IncidentCard
                  priority="HIGH"
                  title="Domestic Disturbance"
                  description="Multiple 911 calls reporting loud argument and possible violence"
                  location="W Main Avenue, Apartment 4B - CA 5.2k to made"
                  time="8 min ago"
                  status="en-route"
                />
                <IncidentCard
                  priority="MEDIUM"
                  title="Suspicious Vehicle"
                  description="Vehicle matching description of recent burglary seen in residential area"
                  location="W 6TH ST, 3rd-20th - CA 3.4k dispatched"
                  time="12 min ago"
                  status="investigating"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
