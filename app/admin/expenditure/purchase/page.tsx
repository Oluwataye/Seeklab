"use client"

import { useState } from "react"
import { ShoppingBasket, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"

// Sample data
const initialPurchases = [
  {
    id: "PO-10001",
    vendor: "Tech Solutions Ltd",
    date: "15/03/2025",
    amount: "NGN 2,500,000.00",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    items: [
      { name: "Laptops", quantity: 10, unitPrice: "NGN 200,000.00", total: "NGN 2,000,000.00" },
      { name: "Monitors", quantity: 10, unitPrice: "NGN 50,000.00", total: "NGN 500,000.00" },
    ],
    notes: "Standard delivery, all items received in good condition",
  },
  {
    id: "PO-10002",
    vendor: "Global Office Supplies",
    date: "18/03/2025",
    amount: "NGN 750,000.00",
    paymentStatus: "Paid",
    deliveryStatus: "In Transit",
    items: [
      { name: "Office Chairs", quantity: 20, unitPrice: "NGN 25,000.00", total: "NGN 500,000.00" },
      { name: "Filing Cabinets", quantity: 10, unitPrice: "NGN 25,000.00", total: "NGN 250,000.00" },
    ],
    notes: "Express delivery requested",
  },
  {
    id: "PO-10003",
    vendor: "Premium Furniture Co.",
    date: "20/03/2025",
    amount: "NGN 1,200,000.00",
    paymentStatus: "Partial",
    deliveryStatus: "Delivered",
    items: [
      { name: "Executive Desks", quantity: 5, unitPrice: "NGN 150,000.00", total: "NGN 750,000.00" },
      { name: "Conference Table", quantity: 1, unitPrice: "NGN 450,000.00", total: "NGN 450,000.00" },
    ],
    notes: "50% payment made, balance due on delivery",
  },
  {
    id: "PO-10004",
    vendor: "Industrial Equipment Inc.",
    date: "25/03/2025",
    amount: "NGN 950,000.00",
    paymentStatus: "Paid",
    deliveryStatus: "Pending",
    items: [
      { name: "Generator", quantity: 1, unitPrice: "NGN 750,000.00", total: "NGN 750,000.00" },
      { name: "Air Conditioners", quantity: 2, unitPrice: "NGN 100,000.00", total: "NGN 200,000.00" },
    ],
    notes: "Delivery scheduled for next week",
  },
  {
    id: "PO-10005",
    vendor: "Quality Paper Products",
    date: "28/03/2025",
    amount: "NGN 350,000.00",
    paymentStatus: "Unpaid",
    deliveryStatus: "Delivered",
    items: [
      { name: "Printer Paper", quantity: 100, unitPrice: "NGN 2,500.00", total: "NGN 250,000.00" },
      { name: "Stationery", quantity: 1, unitPrice: "NGN 100,000.00", total: "NGN 100,000.00" },
    ],
    notes: "Payment due within 30 days",
  },
]

export default function PurchasePage() {
  const [purchases, setPurchases] = useState(initialPurchases)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState<any>(null)

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Form fields for add/edit purchase
  const formFields = [
    { name: "vendor", label: "Vendor", type: "text", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "amount", label: "Total Amount", type: "text", required: true },
    {
      name: "paymentStatus",
      label: "Payment Status",
      type: "select",
      required: true,
      options: [
        { value: "Paid", label: "Paid" },
        { value: "Partial", label: "Partial" },
        { value: "Unpaid", label: "Unpaid" },
      ],
    },
    {
      name: "deliveryStatus",
      label: "Delivery Status",
      type: "select",
      required: true,
      options: [
        { value: "Delivered", label: "Delivered" },
        { value: "In Transit", label: "In Transit" },
        { value: "Pending", label: "Pending" },
      ],
    },
    { name: "invoiceNumber", label: "Invoice Number", type: "text", required: false },
    { name: "paymentDueDate", label: "Payment Due Date", type: "date", required: false },
    { name: "notes", label: "Notes", type: "textarea", required: false },
  ]

  // Handle add purchase
  const handleAddPurchase = (formData: any) => {
    // Extract form data
    const newPurchase = {
      id: `PO-${10000 + purchases.length + 1}`,
      ...formData,
      // Initialize with empty items array - in a real app, you would add UI for adding items
      items: [],
    }
    setPurchases([...purchases, newPurchase])
    setIsAddModalOpen(false)
  }

  // Handle edit purchase
  const handleEditPurchase = (formData: any) => {
    const updatedPurchases = purchases.map((purchase) =>
      purchase.id === currentPurchase.id
        ? {
            ...purchase,
            ...formData,
            // Preserve the existing items
            items: currentPurchase.items || [],
          }
        : purchase,
    )
    setPurchases(updatedPurchases)
    setIsEditModalOpen(false)
  }

  // Handle delete purchase
  const handleDeletePurchase = (id: string) => {
    const updatedPurchases = purchases.filter((purchase) => purchase.id !== id)
    setPurchases(updatedPurchases)
  }

  // Handle view purchase
  const handleViewPurchase = (purchase: any) => {
    setCurrentPurchase(purchase)
    setIsViewModalOpen(true)
  }

  // Handle edit purchase click
  const handleEditPurchaseClick = (purchase: any) => {
    setCurrentPurchase(purchase)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <ShoppingBasket className="h-5 w-5 mr-2" />
          Purchase Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Purchase
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search purchases..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Purchase ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vendor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Delivery Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{purchase.vendor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={purchase.paymentStatus}
                      statusMap={{
                        Paid: "success",
                        Partial: "warning",
                        Unpaid: "error",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={purchase.deliveryStatus}
                      statusMap={{
                        Delivered: "success",
                        "In Transit": "warning",
                        Pending: "info",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={purchase}
                      itemType="Purchase"
                      onView={() => handleViewPurchase(purchase)}
                      onEdit={() => handleEditPurchaseClick(purchase)}
                      onDelete={() => handleDeletePurchase(purchase.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Purchase"
        fields={formFields}
        onSubmit={handleAddPurchase}
        mode="add"
        itemType="Purchase"
      />

      {/* Edit Purchase Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Purchase"
        fields={formFields}
        initialData={currentPurchase}
        onSubmit={handleEditPurchase}
        mode="edit"
        itemType="Purchase"
      />

      {/* View Purchase Modal */}
      {currentPurchase && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Purchase Details: ${currentPurchase.id}`}
          details={[
            { label: "Purchase ID", value: currentPurchase.id },
            { label: "Vendor", value: currentPurchase.vendor },
            { label: "Date", value: currentPurchase.date },
            { label: "Amount", value: currentPurchase.amount },
            { label: "Payment Status", value: currentPurchase.paymentStatus },
            { label: "Delivery Status", value: currentPurchase.deliveryStatus },
            { label: "Notes", value: currentPurchase.notes || "N/A" },
          ]}
        >
          <div className="mt-4">
            <h3 className="text-lg font-medium">Items</h3>
            {currentPurchase.items && currentPurchase.items.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 mt-2">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPurchase.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{item.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{item.unitPrice}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No items available</p>
            )}
          </div>
        </ViewDetails>
      )}
    </div>
  )
}
