import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import { BanknoteIcon, FileTextIcon as FileText2, PackageIcon, ReceiptIcon, PieChart } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Report Management",
  description: "Report Management System",
}

const reportSections = [
  {
    title: "Financial Reports",
    items: [
      { name: "Bank", href: "/admin/report/bank", icon: BanknoteIcon },
      { name: "Financial Statement", href: "/admin/report/financial-statement", icon: FileText2 },
    ],
  },
  {
    title: "Operational Reports",
    items: [
      { name: "Inventory", href: "/admin/report/inventory", icon: PackageIcon },
      { name: "Expenses", href: "/admin/report/expenses", icon: ReceiptIcon },
    ],
  },
  {
    title: "Management Reports",
    items: [{ name: "Summary", href: "/admin/report/summary", icon: PieChart }],
  },
]

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Report Management" sections={reportSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
