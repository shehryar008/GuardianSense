interface StatItemProps {
  value: string
  label: string
}

export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-2xl font-bold text-blue-500">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}
