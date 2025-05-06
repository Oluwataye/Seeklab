"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function HRRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/admin/hr") {
      router.replace("/admin/hr/employee")
    }
  }, [pathname, router])

  return null
}
