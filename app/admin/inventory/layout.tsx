import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import {
  Box,
  ShoppingBag,
  ArrowLeftRight,
  Sliders,
  Recycle,
  Archive,
  AlertTriangle,
  WarehouseIcon,
  Grid,
  Grid3x3,
} from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Inventory Management",
  description: "Inventory Management System",
}

const inventorySections = [
  {
    title: "Products",
    items: [{ name: "Product", href: "/admin/inventory/product", icon: Box }],
  },
  {
    title: "Stock Management",
    items: [
      { name: "Stock Purchase", href: "/admin/inventory/stock-purchase", icon: ShoppingBag },
      { name: "Stock Transfer", href: "/admin/inventory/stock-transfer", icon: ArrowLeftRight },
      { name: "Stock Adjustment", href: "/admin/inventory/stock-adjustment", icon: Sliders },
      { name: "Used Resources", href: "/admin/inventory/used-resources", icon: Recycle },
      { name: "Stock Collection", href: "/admin/inventory/stock-collection", icon: Archive },
      { name: "Damage Stock", href: "/admin/inventory/damage-stock", icon: AlertTriangle },
    ],
  },
  {
    title: "Locations",
    items: [
      {
        name: "Outstation",
        href: "/admin/inventory/outstation",
        icon: WarehouseIcon,
      },
    ],
  },
  {
    title: "Categories",
    items: [
      { name: "Category", href: "/admin/inventory/category", icon: Grid },
      { name: "Sub Category", href: "/admin/inventory/sub-category", icon: Grid3x3 },
    ],
  },
]

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <SidebarNavigation moduleName="Inventory Management" sections={inventorySections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
