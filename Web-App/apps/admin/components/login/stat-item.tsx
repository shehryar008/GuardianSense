interface StatItemProps {
  value: string
  label: string
}

export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-violet-500">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
