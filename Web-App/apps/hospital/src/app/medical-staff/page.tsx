import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { PhoneIcon, EmailIcon, ClockIcon } from "../../../components/shared/icons"

const staffMembers = [
  {
    initials: "DSJ",
    name: "Dr. Sarah Johnson",
    role: "Emergency Physician",
    phone: "+1 (555) 123-4567",
    email: "sarah.j@guardiansense.com",
    shift: "08:00 - 16:00",
    status: "On Duty",
    avatarColor: "bg-teal-500",
  },
  {
    initials: "MC",
    name: "Michael Chen",
    role: "Paramedic",
    phone: "+1 (555) 234-5678",
    email: "michael.c@guardiansense.com",
    shift: "08:00 - 16:00",
    status: "On Mission",
    avatarColor: "bg-orange-400",
  },
  {
    initials: "ER",
    name: "Emily Rodriguez",
    role: "EMT",
    phone: "+1 (555) 345-6789",
    email: "emily.r@guardiansense.com",
    shift: "12:00 - 20:00",
    status: "On Duty",
    avatarColor: "bg-pink-500",
  },
  {
    initials: "DJW",
    name: "Dr. James Wilson",
    role: "Emergency Physician",
    phone: "+1 (555) 456-7890",
    email: "james.w@guardiansense.com",
    shift: "16:00 - 00:00",
    status: "Off Duty",
    avatarColor: "bg-teal-500",
  },
  {
    initials: "LM",
    name: "Lisa Martinez",
    role: "Paramedic",
    phone: "+1 (555) 567-8901",
    email: "lisa.m@guardiansense.com",
    shift: "08:00 - 16:00",
    status: "On Mission",
    avatarColor: "bg-purple-500",
  },
  {
    initials: "DK",
    name: "David Kim",
    role: "EMT",
    phone: "+1 (555) 678-9012",
    email: "david.k@guardiansense.com",
    shift: "00:00 - 08:00",
    status: "On Duty",
    avatarColor: "bg-green-500",
  },
]

function StatusBadge({ status }: { status: string }) {
  const colors = {
    "On Duty": "bg-green-100 text-green-600",
    "On Mission": "bg-orange-100 text-orange-600",
    "Off Duty": "bg-gray-100 text-gray-600",
  }
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}

function StaffCard({
  initials,
  name,
  role,
  phone,
  email,
  shift,
  status,
  avatarColor,
}: {
  initials: string
  name: string
  role: string
  phone: string
  email: string
  shift: string
  status: string
  avatarColor: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm`}
          >
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <PhoneIcon className="w-4 h-4 text-gray-400" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <EmailIcon className="w-4 h-4 text-gray-400" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span>Shift: {shift}</span>
        </div>
      </div>
    </div>
  )
}

export default function MedicalStaffPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Medical Staff" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Medical Staff</h1>
            <p className="text-gray-500">Overview of all medical personnel and their current status</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffMembers.map((staff, index) => (
              <StaffCard key={index} {...staff} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
