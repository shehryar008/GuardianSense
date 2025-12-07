import { ActivityIcon, RadioIcon, FileTextIcon, PoliceBadgeIcon } from "../../../components/shared/icons"
import { FeatureItem } from "../../../components/login/feature-item"
import { StatItem } from "../../../components/login/stat-item"
import { PoliceLoginForm } from "../../../components/login/police-login-form"

export default function PoliceLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Main Content */}
      <main className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="flex-1 flex flex-col justify-center px-12 lg:px-20 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center">
              <PoliceBadgeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-500">GuardianSense</h1>
              <p className="text-gray-500 text-sm">Police Center</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Police Command
            <br />
            Access Portal
          </h2>
          <p className="text-gray-500 mb-10 max-w-md">
            Secure access for law enforcement personnel to manage incidents, coordinate responses, and oversee station
            operations.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-10 max-w-lg">
            <FeatureItem
              icon={<ActivityIcon className="h-6 w-6 text-blue-500" />}
              title="Real-Time Incident Monitoring"
              description="Track active incidents, unit locations, and critical case status in real-time"
            />
            <FeatureItem
              icon={<RadioIcon className="h-6 w-6 text-blue-500" />}
              title="Dispatch Coordination"
              description="Coordinate emergency responses & patrol unit deployment"
            />
            <FeatureItem
              icon={<FileTextIcon className="h-6 w-6 text-blue-500" />}
              title="Case Records & Analytics"
              description="Access case files, investigation history, and performance metrics"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <StatItem value="24/7" label="Active Patrol" />
            <StatItem value="158" label="Officers on Duty" />
            <StatItem value="98%" label="Response Rate" />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-12">
          <PoliceLoginForm />
        </div>
      </main>
    </div>
  )
}
