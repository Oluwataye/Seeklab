import type { ReactNode } from "react"

interface ViewDetailsProps {
  label: string
  value: ReactNode
}

export function ViewDetails({ label, value }: ViewDetailsProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

export default ViewDetails
