"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Settings,
  Users,
  FileText,
  Phone,
  DollarSign,
  Package,
  CreditCard,
  FileSpreadsheet,
  PenToolIcon as Tool,
  BarChart2,
  Store,
  CalendarIcon,
  Briefcase,
} from "lucide-react"

interface SubMenuItem {
  name: string
  href: string
  hasChildren?: boolean
}

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
  subMenuItems?: SubMenuItem[]
}

export default function SidebarMenu() {
  const pathname = usePathname()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const menuItems: MenuItem[] = [
    {
      name: "Configuration",
      href: "/admin/configuration/lists",
      icon: Settings,
      subMenuItems: [
        { name: "Lists", href: "/admin/configuration/lists", hasChildren: true },
        { name: "Settings", href: "/admin/configuration/settings", hasChildren: true },
        { name: "Location", href: "/admin/configuration/location", hasChildren: true },
        { name: "Account", href: "/admin/configuration/account", hasChildren: true },
        { name: "Company", href: "/admin/configuration/company", hasChildren: true },
        { name: "Store", href: "/admin/configuration/store", hasChildren: true },
        { name: "Role", href: "/admin/configuration/role", hasChildren: true },
        { name: "Currency", href: "/admin/configuration/currency", hasChildren: true },
        { name: "Bank", href: "/admin/configuration/bank", hasChildren: true },
        { name: "Form Field", href: "/admin/configuration/form-field", hasChildren: true },
      ],
    },
    {
      name: "HR",
      href: "/admin/hr/employee",
      icon: Users,
      subMenuItems: [
        { name: "Employee", href: "/admin/hr/employee", hasChildren: true },
        { name: "Department", href: "/admin/hr/department", hasChildren: true },
        { name: "Section", href: "/admin/hr/section", hasChildren: true },
        { name: "Position", href: "/admin/hr/position", hasChildren: true },
        { name: "Pay Type", href: "/admin/hr/pay-type", hasChildren: true },
        { name: "Leave Type", href: "/admin/hr/leave-type", hasChildren: true },
        { name: "Pay Grade", href: "/admin/hr/pay-grade", hasChildren: true },
      ],
    },
    {
      name: "Payroll",
      href: "/admin/payroll/template",
      icon: FileText,
      subMenuItems: [
        { name: "Template", href: "/admin/payroll/template", hasChildren: true },
        { name: "Payment", href: "/admin/payroll/payment", hasChildren: true },
      ],
    },
    {
      name: "Contact",
      href: "/admin/contact/contractor",
      icon: Phone,
      subMenuItems: [
        { name: "Contractor", href: "/admin/contact/contractor", hasChildren: true },
        { name: "Lender", href: "/admin/contact/lender", hasChildren: true },
        { name: "Supplier", href: "/admin/contact/supplier", hasChildren: true },
        { name: "Customer", href: "/admin/contact/customer", hasChildren: true },
      ],
    },
    {
      name: "Finance",
      href: "/admin/finance/discount-group",
      icon: DollarSign,
      subMenuItems: [
        { name: "Discount Group", href: "/admin/finance/discount-group", hasChildren: true },
        { name: "Tax Group", href: "/admin/finance/tax-group", hasChildren: true },
        { name: "Promotional Code", href: "/admin/finance/promotional-code", hasChildren: true },
        { name: "Account", href: "/admin/finance/account", hasChildren: true },
        { name: "Staff Loan", href: "/admin/finance/staff-loan", hasChildren: true },
        { name: "Company Loan", href: "/admin/finance/company-loan", hasChildren: true },
        { name: "Transfer", href: "/admin/finance/transfer", hasChildren: true },
      ],
    },
    {
      name: "Inventory",
      href: "/admin/inventory/product",
      icon: Package,
      subMenuItems: [
        { name: "Product", href: "/admin/inventory/product", hasChildren: true },
        { name: "Stock Purchase", href: "/admin/inventory/stock-purchase", hasChildren: true },
        { name: "Stock Transfer", href: "/admin/inventory/stock-transfer", hasChildren: true },
        { name: "Stock Adjustment", href: "/admin/inventory/stock-adjustment", hasChildren: true },
        { name: "Used Resources", href: "/admin/inventory/used-resources", hasChildren: true },
        { name: "Stock Collection", href: "/admin/inventory/stock-collection", hasChildren: true },
        { name: "Damage Stock", href: "/admin/inventory/damage-stock", hasChildren: true },
        { name: "Warehouse", href: "/admin/inventory/warehouse", hasChildren: true },
        { name: "Category", href: "/admin/inventory/category", hasChildren: true },
        { name: "Sub Category", href: "/admin/inventory/sub-category", hasChildren: true },
        { name: "Brand", href: "/admin/inventory/brand", hasChildren: true },
        { name: "Unit", href: "/admin/inventory/unit", hasChildren: true },
        { name: "Author", href: "/admin/inventory/author", hasChildren: true },
      ],
    },
    {
      name: "Payment",
      href: "/admin/payment/deposit",
      icon: CreditCard,
      subMenuItems: [
        { name: "Deposit", href: "/admin/payment/deposit", hasChildren: true },
        { name: "Miscellaneous Income", href: "/admin/payment/miscellaneous-income", hasChildren: true },
      ],
    },
    {
      name: "Expenditure",
      href: "/admin/expenditure/purchase",
      icon: FileSpreadsheet,
      subMenuItems: [
        { name: "Purchase", href: "/admin/expenditure/purchase", hasChildren: true },
        { name: "Expenses", href: "/admin/expenditure/expenses", hasChildren: true },
        { name: "Expenses Category", href: "/admin/expenditure/expenses-category", hasChildren: true },
      ],
    },
    {
      name: "Service",
      href: "/admin/service/general",
      icon: Tool,
      subMenuItems: [{ name: "General", href: "/admin/service/general", hasChildren: true }],
    },
    {
      name: "Report",
      href: "/admin/report/bank",
      icon: BarChart2,
      subMenuItems: [
        { name: "Bank", href: "/admin/report/bank", hasChildren: true },
        { name: "Financial Statement", href: "/admin/report/financial-statement", hasChildren: true },
        { name: "Inventory", href: "/admin/report/inventory", hasChildren: true },
        { name: "Expenses", href: "/admin/report/expenses", hasChildren: true },
        { name: "Summary", href: "/admin/report/summary", hasChildren: true },
      ],
    },
    {
      name: "Store",
      href: "/admin/store/store",
      icon: Store,
      subMenuItems: [{ name: "Store", href: "/admin/store/store", hasChildren: true }],
    },
    {
      name: "Project",
      href: "/admin/project/projects",
      icon: Briefcase,
      subMenuItems: [
        { name: "Projects", href: "/admin/project/projects", hasChildren: true },
        { name: "Tasks", href: "/admin/project/tasks", hasChildren: true },
        { name: "Teams", href: "/admin/project/teams", hasChildren: true },
      ],
    },
    {
      name: "Calendar",
      href: "/admin/calendar/events",
      icon: CalendarIcon,
      subMenuItems: [
        { name: "Events", href: "/admin/calendar/events", hasChildren: true },
        { name: "Appointments", href: "/admin/calendar/appointments", hasChildren: true },
        { name: "Schedule", href: "/admin/calendar/schedule", hasChildren: true },
      ],
    },
  ]

  const toggleMenu = (menuName: string) => {
    if (expandedMenu === menuName) {
      setExpandedMenu(null)
    } else {
      setExpandedMenu(menuName)
    }
  }

  return (
    <aside className="w-[150px] bg-red-900 text-white flex flex-col fixed h-full">
      <div className="p-4 border-b border-red-800">
        <div className="flex justify-center mb-2">
          <Image src="/images/osoft-logo.png" alt="DeskFlow Logo" width={100} height={50} />
        </div>
        <p className="text-xs text-center text-gray-300">DeskFlow</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name} className="relative">
              {item.subMenuItems ? (
                <div>
                  <Link href={item.href} className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-red-800">
                    <item.icon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </div>
              ) : (
                <Link href={item.href} className="flex items-center px-4 py-2 text-gray-300 hover:bg-red-800">
                  <item.icon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
