import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import SidebarNavigation from "@/components/sidebar-navigation"
import { HardHat, Briefcase, Truck, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Contact Management",
  description: "Contact Management System",
}

const contactSections = [
  {
    title: "Business Contacts",
    items: [
      { name: "Contractor", href: "/admin/contact/contractor", icon: HardHat },
      { name: "Lender", href: "/admin/contact/lender", icon: Briefcase },
      { name: "Supplier", href: "/admin/contact/supplier", icon: Truck },
    ],
  },
  {
    title: "Customer Management",
    items: [{ name: "Customer", href: "/admin/contact/customer", icon: Users }],
  },
]

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If we're at the root Contact path, redirect to the first item
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname
    if (pathname === "/admin/contact") {
      redirect("/admin/contact/contractor")
    }
  }

  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Contact Management" sections={contactSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
