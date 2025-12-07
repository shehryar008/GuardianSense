import { HeartIcon, ActivityIcon, CheckCircleIcon } from "../../../components/shared/icons"
import { FeatureItem } from "../../../components/login/feature-item"
import { StatItem } from "../../../components/login/stat-item"
import { HospitalLoginForm } from "../../../components/login/hospital-login-form"

export default function HospitalLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 relative">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-400" />

      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side - Branding */}
          <div className="flex-1 max-w-xl">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-teal-500">GuardianSense</h1>
                <p className="text-sm text-gray-500">Medical Center</p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hospital Healthcare
              <br />
              Access Portal
            </h2>
            <p className="text-gray-600 mb-8">
              Secure access for medical personnel to manage patient care, emergency services, and hospital operations.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <FeatureItem
                icon={<ActivityIcon className="w-6 h-6 text-teal-500" />}
                title="Real-Time Patient Monitoring"
                description="Track patient admissions, bed availability, and critical care status in real-time"
              />
              <FeatureItem
                icon={<HeartIcon className="w-6 h-6 text-teal-500" />}
                title="Emergency Department"
                description="Coordinate emergency responses, ambulance dispatch, and trauma care"
              />
              <FeatureItem
                icon={<CheckCircleIcon className="w-6 h-6 text-teal-500" />}
                title="Medical Records & Analytics"
                description="Access patient records, treatment history, and performance metrics"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatItem value="24/7" label="Emergency Care" />
              <StatItem value="342" label="Active Staff" />
              <StatItem value="98%" label="Bed Occupancy" />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <HospitalLoginForm />
        </div>
      </main>
    </div>
  )
}
