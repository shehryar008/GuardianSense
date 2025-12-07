interface StatItemProps {
  value: string
  label: string
}

export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="text-2xl font-bold text-teal-500">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}
