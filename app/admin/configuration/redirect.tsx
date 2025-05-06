"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function ConfigurationRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/admin/configuration") {
      router.replace("/admin/configuration/lists")
    }
  }, [pathname, router])

  return null
}
