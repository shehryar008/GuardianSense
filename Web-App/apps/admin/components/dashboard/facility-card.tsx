import { TrendingUpIcon, TrendingDownIcon, HospitalIcon, PoliceIcon } from "../shared/icons"


interface FacilityData {
  rank: number
  name: string
  score: number
  response: string
  satisfaction?: string
  resolution?: string
  beds?: number
  units?: number
}

interface FacilityCardProps {
  title: string
  subtitle: string
  type: "hospital" | "police"
  variant: "top" | "under"
  facilities: FacilityData[]
}

export function FacilityCard({ title, subtitle, type, variant, facilities }: FacilityCardProps) {
  const isTop = variant === "top"
  const TrendIcon = isTop ? TrendingUpIcon : TrendingDownIcon

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isTop ? "bg-green-50" : "bg-red-50"}`}>
            {type === "hospital" ? (
              <HospitalIcon className={`w-4 h-4 ${isTop ? "text-green-600" : "text-red-600"}`} />
            ) : (
              <PoliceIcon className={`w-4 h-4 ${isTop ? "text-green-600" : "text-red-600"}`} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <TrendIcon className={`w-5 h-5 ${isTop ? "text-green-500" : "text-red-500"}`} />
      </div>

      {/* Facilities List */}
      <div className="space-y-3">
        {facilities.map((facility) => (
          <div
            key={facility.name}
            className={`p-3 rounded-lg border ${
              isTop ? "bg-green-50/50 border-green-100" : "bg-red-50/50 border-red-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                  isTop ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {facility.rank}
              </span>
              <span className="font-medium text-gray-900 text-sm">{facility.name}</span>
              <span
                className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${
                  isTop ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                Score: {facility.score}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Response</p>
                <p className={`text-sm font-semibold ${isTop ? "text-green-600" : "text-red-600"}`}>
                  {facility.response}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">
                  {type === "hospital" ? "Satisfaction" : "Resolution"}
                </p>
                <p className={`text-sm font-semibold ${isTop ? "text-green-600" : "text-red-600"}`}>
                  {facility.satisfaction || facility.resolution}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">{type === "hospital" ? "Beds" : "Units"}</p>
                <p className="text-sm font-semibold text-gray-700">{facility.beds ?? facility.units}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
