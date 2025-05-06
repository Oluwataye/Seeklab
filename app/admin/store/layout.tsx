import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import { Store } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Store Management",
  description: "Store Management System",
}

const storeSections = [
  {
    title: "Store Management",
    items: [{ name: "Store", href: "/admin/store/store", icon: Store }],
  },
]

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Store Management" sections={storeSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
