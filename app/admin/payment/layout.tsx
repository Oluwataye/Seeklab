import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import { PiggyBank, CurrencyIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Payment Management",
  description: "Payment Management System",
}

const paymentSections = [
  {
    title: "Income Management",
    items: [
      { name: "Deposit", href: "/admin/payment/deposit", icon: PiggyBank },
      { name: "Miscellaneous Income", href: "/admin/payment/miscellaneous-income", icon: CurrencyIcon },
    ],
  },
]

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Payment Management" sections={paymentSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
