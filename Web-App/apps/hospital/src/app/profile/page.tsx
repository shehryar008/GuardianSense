import type React from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import {
  HospitalIcon,
  PhoneIcon,
  DocumentIcon,
  EmailIcon,
  LocationIcon,
  CalendarIcon,
  CertificationIcon,
  DepartmentIcon,
} from "../../../components/shared/icons"

function FacilityInfoItem({
  icon,
  label,
  value,
  iconBgColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  iconBgColor: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function CertificationCard({
  title,
  year,
  iconBgColor,
}: {
  title: string
  year: string
  iconBgColor: string
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
      <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
        <CertificationIcon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">Since {year}</p>
      </div>
    </div>
  )
}

function DepartmentItem({
  icon,
  name,
  staff,
  iconColor,
}: {
  icon: React.ReactNode
  name: string
  staff: string
  iconColor: string
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className={iconColor}>{icon}</span>
        <span className="text-sm text-gray-700">{name}</span>
      </div>
      <span className="text-xs text-gray-500">{staff}</span>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Profile" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Hospital Profile</h1>
            <p className="text-gray-500">GuardianSense Medical Center information and credentials</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Hospital Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4">
                  <HospitalIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">GuardianSense</h2>
                <p className="text-gray-500">Medical Center</p>
                <span className="mt-2 px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                  Operational 24/7
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Capacity</span>
                  <span className="text-gray-900 font-medium text-sm">500 Beds</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Ambulances</span>
                  <span className="text-gray-900 font-medium text-sm">24 Units</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Staff</span>
                  <span className="text-gray-900 font-medium text-sm">850+</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 text-sm">Departments</span>
                  <span className="text-gray-900 font-medium text-sm">18</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Facility Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FacilityInfoItem
                    icon={<HospitalIcon className="w-5 h-5 text-teal-600" />}
                    label="Hospital Name"
                    value="GuardianSense Medical Center"
                    iconBgColor="bg-teal-100"
                  />
                  <FacilityInfoItem
                    icon={<EmailIcon className="w-5 h-5 text-teal-600" />}
                    label="Email"
                    value="contact@guardiansense.com"
                    iconBgColor="bg-teal-100"
                  />
                  <FacilityInfoItem
                    icon={<PhoneIcon className="w-5 h-5 text-green-600" />}
                    label="Emergency Line"
                    value="+1 (800) 911-HELP"
                    iconBgColor="bg-green-100"
                  />
                  <FacilityInfoItem
                    icon={<LocationIcon className="w-5 h-5 text-orange-500" />}
                    label="Location"
                    value="1234 Medical Plaza, NY 10001"
                    iconBgColor="bg-orange-100"
                  />
                  <FacilityInfoItem
                    icon={<DocumentIcon className="w-5 h-5 text-red-500" />}
                    label="License Number"
                    value="MC-2023-4567890"
                    iconBgColor="bg-red-100"
                  />
                  <FacilityInfoItem
                    icon={<CalendarIcon className="w-5 h-5 text-teal-600" />}
                    label="Established"
                    value="January 15, 1985"
                    iconBgColor="bg-teal-100"
                  />
                </div>
              </div>

              {/* Certifications & Accreditations */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications & Accreditations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CertificationCard title="Joint Commission Accredited" year="2023" iconBgColor="bg-orange-400" />
                  <CertificationCard title="Level 1 Trauma Center" year="2022" iconBgColor="bg-red-400" />
                  <CertificationCard title="Stroke Center Certified" year="2023" iconBgColor="bg-orange-400" />
                  <CertificationCard title="Cardiac Care Excellence" year="2023" iconBgColor="bg-red-400" />
                </div>
              </div>

              {/* Key Departments */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Departments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DepartmentItem
                    icon={<DepartmentIcon className="w-4 h-4" />}
                    name="Emergency Services"
                    staff="45 staff"
                    iconColor="text-red-500"
                  />
                  <DepartmentItem
                    icon={<DepartmentIcon className="w-4 h-4" />}
                    name="Cardiology"
                    staff="38 staff"
                    iconColor="text-pink-500"
                  />
                  <DepartmentItem
                    icon={<DepartmentIcon className="w-4 h-4" />}
                    name="Neurology"
                    staff="42 staff"
                    iconColor="text-purple-500"
                  />
                  <DepartmentItem
                    icon={<DepartmentIcon className="w-4 h-4" />}
                    name="Pediatrics"
                    staff="52 staff"
                    iconColor="text-blue-500"
                  />
                  <DepartmentItem
                    icon={<DepartmentIcon className="w-4 h-4" />}
                    name="Orthopedics"
                    staff="35 staff"
                    iconColor="text-teal-500"
                  />
                  <DepartmentItem
                    icon={<DepartmentIcon className="w-4 h-4" />}
                    name="Radiology"
                    staff="28 staff"
                    iconColor="text-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
