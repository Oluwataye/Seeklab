"use client"

import { cva } from "class-variance-authority"

const badgeVariants = cva("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", {
  variants: {
    variant: {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      error: "bg-red-100 text-red-800",
      warning: "bg-orange-100 text-orange-800",
      info: "bg-gray-100 text-gray-800",
    },
  },
  defaultVariants: {
    variant: "info",
  },
})

interface StatusBadgeProps {
  status: string
  variant?: "active" | "inactive" | "pending" | "error" | "warning" | "info"
  className?: string
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  // Determine variant based on status if not explicitly provided
  const determineVariant = () => {
    if (variant) return variant

    const statusLower = status.toLowerCase()
    if (statusLower.includes("active")) return "active"
    if (statusLower.includes("inactive") || statusLower.includes("disabled")) return "inactive"
    if (statusLower.includes("pending") || statusLower.includes("waiting")) return "pending"
    if (statusLower.includes("error") || statusLower.includes("failed")) return "error"
    if (statusLower.includes("warning")) return "warning"
    return "info"
  }

  return <span className={badgeVariants({ variant: determineVariant(), className })}>{status}</span>
}

export default StatusBadge
