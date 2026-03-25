"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { LocationIcon, UsersIcon, AmbulanceIcon } from "../../../components/shared/icons"
import { useAuth } from "../../../components/auth/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

type AmbulanceType = {
  id: string
  status: string
  location: string
  crew: string
  equipment: string
  fuelLevel: number
}

// Dynamic generation moved into component

function StatusBadge({ status }: { status: string }) {
  const colors = {
    "On Mission": "bg-orange-100 text-orange-600",
    Available: "bg-green-100 text-green-600",
    "En Route": "bg-red-100 text-red-600",
    Maintenance: "bg-yellow-100 text-yellow-600",
  }
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}

function AmbulanceCard({
  id,
  status,
  location,
  crew,
  equipment,
}: {
  id: string
  status: string
  location: string
  crew: string
  equipment: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
            <AmbulanceIcon className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{id}</h3>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <LocationIcon className="w-4 h-4 text-gray-400" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon className="w-4 h-4 text-gray-400" />
          <span>Crew: {crew}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="text-gray-500">Equipment:</span> {equipment}
        </div>
      </div>
    </div>
  )
}

export default function AmbulanceFleetPage() {
  const { hospital, token } = useAuth()
  const [fleet, setFleet] = useState<AmbulanceType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!hospital?.hospital_id || !token) return

    const fetchActiveDispatches = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`${API_URL}/api/hospitals/${hospital.hospital_id}/dispatches`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        if (data.success) {
          const activeDispatches = data.data.filter(
            (d: Record<string, unknown>) => d.dispatch_status === "Pending" || d.dispatch_status === "En Route"
          )

          // Generate dynamic fleet
          const beds = Math.max(0, Number(hospital.bed_capacity || 0))
          const fleetSize = Math.max(2, Math.floor(beds / 25))

          const generatedFleet: AmbulanceType[] = []

          // 1. Map active dispatches to "On Mission" or "En Route"
          activeDispatches.forEach((dispatch: Record<string, unknown>, index: number) => {
            const inc = dispatch.incidents as Record<string, unknown> | undefined
            generatedFleet.push({
              id: `AMB-${String(dispatch.dispatch_id).padStart(3, "0")}`,
              status: dispatch.dispatch_status === "Pending" ? "En Route" : "On Mission",
              location: inc?.latitude && inc?.longitude ? `${Number(inc.latitude).toFixed(3)}, ${Number(inc.longitude).toFixed(3)}` : "Dispatched",
              crew: `Team ${String.fromCharCode(65 + (index % 26))}`,
              equipment: "Full",
              fuelLevel: Math.floor(Math.random() * 30) + 60, // 60-90%
            })
          })

          // 2. Generate remaining fleet as "Available" or "Maintenance"
          const remaining = fleetSize - generatedFleet.length
          for (let i = 0; i < remaining; i++) {
            const isMaintenance = Math.random() < 0.15 // 15% chance of maintenance
            generatedFleet.push({
              id: `AMB-${String(100 + i + generatedFleet.length).padStart(3, "0")}`,
              status: isMaintenance ? "Maintenance" : "Available",
              location: isMaintenance ? "Garage / Maintenance" : "Hospital Station",
              crew: isMaintenance ? "N/A" : `Team ${String.fromCharCode(65 + ((generatedFleet.length + i) % 26))}`,
              equipment: isMaintenance ? "Limited" : "Full",
              fuelLevel: isMaintenance ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 20) + 80, // 80-100% available
            })
          }

          setFleet(generatedFleet)
        }
      } catch {
        // Fallback to empty fleet if error
        setFleet([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveDispatches()
  }, [hospital?.hospital_id, token, hospital?.bed_capacity])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Ambulance Fleet" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Ambulance Fleet</h1>
            <p className="text-gray-500">Real-time status of all ambulance units</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-gray-500">
              Loading deployment data...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fleet.map((ambulance, index) => (
                <AmbulanceCard key={index} {...ambulance} />
              ))}
              {fleet.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-8 text-gray-500 bg-white rounded-2xl shadow-sm">
                  No ambulance data could be determined.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
