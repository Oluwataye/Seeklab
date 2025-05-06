import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import { ShoppingBasket, Receipt, ClipboardList } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Expenditure Management",
  description: "Expenditure Management System",
}

const expenditureSections = [
  {
    title: "Purchases & Expenses",
    items: [
      { name: "Purchase", href: "/admin/expenditure/purchase", icon: ShoppingBasket },
      { name: "Expenses", href: "/admin/expenditure/expenses", icon: Receipt },
      { name: "Expenses Category", href: "/admin/expenditure/expenses-category", icon: ClipboardList },
    ],
  },
]

export default function ExpenditureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Expenditure Management" sections={expenditureSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
