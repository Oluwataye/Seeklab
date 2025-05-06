import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import { Wrench } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Service Management",
  description: "Service Management System",
}

const serviceSections = [
  {
    title: "Service Management",
    items: [{ name: "General", href: "/admin/service/general", icon: Wrench }],
  },
]

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Service Management" sections={serviceSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
