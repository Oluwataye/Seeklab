"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { isAuthenticated } from "@/lib/auth"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = isAuthenticated()

    // If not authenticated and trying to access protected route
    if (!authenticated && pathname !== "/") {
      router.replace("/")
    } else if (authenticated && pathname === "/") {
      // If authenticated and on login page, redirect to dashboard
      router.replace("/admin")
    }

    setLoading(false)
  }, [pathname]) // Remove router from dependencies to prevent infinite loops

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return children
}
