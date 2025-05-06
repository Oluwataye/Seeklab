import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import SidebarNavigation from "@/components/sidebar-navigation"
import { FileText, CreditCard } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Payroll Management",
  description: "Payroll Management System",
}

const payrollSections = [
  {
    title: "Payroll Management",
    items: [
      { name: "Template", href: "/admin/payroll/template", icon: FileText },
      { name: "Payment", href: "/admin/payroll/payment", icon: CreditCard },
    ],
  },
]

export default function PayrollLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If we're at the root Payroll path, redirect to the first item
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname
    if (pathname === "/admin/payroll") {
      redirect("/admin/payroll/template")
    }
  }

  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Payroll" sections={payrollSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
