import { Sidebar } from "../../../components/dashboard/sidebar"
import { Header } from "../../../components/dashboard/header"
import { FacilityCard } from "../../../components/dashboard/facility-card"

const topHospitals = [
  { rank: 1, name: "Memorial Medical Center", score: 9.7, response: "3.2 min", satisfaction: "98%", beds: 45 },
  { rank: 2, name: "St. Mary's Regional Hospital", score: 9.4, response: "3.8 min", satisfaction: "96%", beds: 38 },
  { rank: 3, name: "Central City Healthcare", score: 9.2, response: "4.1 min", satisfaction: "95%", beds: 32 },
]

const underHospitals = [
  { rank: 1, name: "Riverside General Hospital", score: 5.3, response: "12.5 min", satisfaction: "72%", beds: 8 },
  { rank: 2, name: "Northside Community Hospital", score: 5.8, response: "11.2 min", satisfaction: "74%", beds: 12 },
  { rank: 3, name: "Eastview Medical Facility", score: 6.1, response: "10.8 min", satisfaction: "76%", beds: 15 },
]

const topPoliceStations = [
  { rank: 1, name: "Downtown Precinct 1", score: 9.6, response: "2.8 min", resolution: "94%", units: 18 },
  { rank: 2, name: "Westside Station 3", score: 9.3, response: "3.1 min", resolution: "91%", units: 15 },
  { rank: 3, name: "Central District HQ", score: 9.0, response: "3.5 min", resolution: "89%", units: 22 },
]

const underPoliceStations = [
  { rank: 1, name: "Southside Precinct 8", score: 4.8, response: "14.2 min", resolution: "65%", units: 6 },
  { rank: 2, name: "East District Station 5", score: 5.2, response: "12.9 min", resolution: "68%", units: 7 },
  { rank: 3, name: "North End Precinct 6", score: 5.6, response: "11.5 min", resolution: "71%", units: 9 },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <FacilityCard
              title="Top Performing Hospitals"
              subtitle="Best response times & patient care"
              type="hospital"
              variant="top"
              facilities={topHospitals}
            />
            <FacilityCard
              title="Underperforming Hospitals"
              subtitle="Require immediate attention"
              type="hospital"
              variant="under"
              facilities={underHospitals}
            />
            <FacilityCard
              title="Top Performing Police Stations"
              subtitle="Excellence in law enforcement"
              type="police"
              variant="top"
              facilities={topPoliceStations}
            />
            <FacilityCard
              title="Underperforming Police Stations"
              subtitle="Require strategic intervention"
              type="police"
              variant="under"
              facilities={underPoliceStations}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
