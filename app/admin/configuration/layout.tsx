import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import SidebarNavigation from "@/components/sidebar-navigation"
import { List, Sliders, MapPin, Building, Store, UserCheck, Globe, Landmark, FormInput } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Configuration",
  description: "System Configuration Settings",
}

const configSections = [
  {
    title: "General Settings",
    items: [
      { name: "Lists", href: "/admin/configuration/lists", icon: List },
      { name: "Settings", href: "/admin/configuration/settings", icon: Sliders },
      { name: "Form Field", href: "/admin/configuration/form-field", icon: FormInput },
    ],
  },
  {
    title: "Company & Location",
    items: [
      { name: "Company", href: "/admin/configuration/company", icon: Building },
      { name: "Location", href: "/admin/configuration/location", icon: MapPin },
      { name: "Store", href: "/admin/configuration/store", icon: Store },
    ],
  },
  {
    title: "User Management",
    items: [
      { name: "Account", href: "/admin/configuration/account", icon: UserCheck },
      { name: "Role", href: "/admin/configuration/role", icon: UserCheck },
      { name: "Currency", href: "/admin/configuration/currency", icon: Globe },
      { name: "Bank", href: "/admin/configuration/bank", icon: Landmark },
    ],
  },
]

export default function ConfigurationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If we're at the root configuration path, redirect to the first item
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname
    if (pathname === "/admin/configuration") {
      redirect("/admin/configuration/lists")
    }
  }

  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Configuration" sections={configSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
