import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import SidebarNavigation from "@/components/sidebar-navigation"
import { User, FolderOpen, Layers, Briefcase, DollarSign, Calendar, BarChart } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - HR Management",
  description: "Human Resources Management System",
}

const hrSections = [
  {
    title: "Personnel Management",
    items: [
      { name: "Employee", href: "/admin/hr/employee", icon: User },
      { name: "Department", href: "/admin/hr/department", icon: FolderOpen },
      { name: "Section", href: "/admin/hr/section", icon: Layers },
      { name: "Position", href: "/admin/hr/position", icon: Briefcase },
    ],
  },
  {
    title: "Compensation & Benefits",
    items: [
      { name: "Pay Type", href: "/admin/hr/pay-type", icon: DollarSign },
      { name: "Leave Type", href: "/admin/hr/leave-type", icon: Calendar },
      { name: "Pay Grade", href: "/admin/hr/pay-grade", icon: BarChart },
    ],
  },
]

export default function HRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If we're at the root HR path, redirect to the first item
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname
    if (pathname === "/admin/hr") {
      redirect("/admin/hr/employee")
    }
  }

  return (
    <div className="flex">
      <SidebarNavigation moduleName="Human Resources" sections={hrSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
