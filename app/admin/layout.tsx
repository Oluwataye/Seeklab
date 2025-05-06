import type React from "react"
import SidebarMenu from "@/components/sidebar-menu"
import AuthGuard from "@/components/auth-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100 font-poppins flex">
        <SidebarMenu />
        <div className="flex-1 ml-[150px]">{children}</div>
      </div>
    </AuthGuard>
  )
}
