import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import { Percent, Receipt, Tag, Activity, Wallet, Building2, ArrowLeftRight } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Finance Management",
  description: "Finance Management System",
}

const financeSections = [
  {
    title: "Pricing & Discounts",
    items: [
      { name: "Discount Group", href: "/admin/finance/discount-group", icon: Percent },
      { name: "Tax Group", href: "/admin/finance/tax-group", icon: Receipt },
      { name: "Promotional Code", href: "/admin/finance/promotional-code", icon: Tag },
    ],
  },
  {
    title: "Financial Accounts",
    items: [{ name: "Account", href: "/admin/finance/account", icon: Activity }],
  },
  {
    title: "Loans & Transfers",
    items: [
      { name: "Staff Loan", href: "/admin/finance/staff-loan", icon: Wallet },
      { name: "Company Loan", href: "/admin/finance/company-loan", icon: Building2 },
      { name: "Transfer", href: "/admin/finance/transfer", icon: ArrowLeftRight },
    ],
  },
]

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <SidebarNavigation moduleName="Finance Management" sections={financeSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
