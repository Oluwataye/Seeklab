"use client"

import { useState } from "react"
import { ShoppingBag, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/lib/hooks/use-toast"

// Mock data for stock purchases
const initialPurchases = [
  {
    id: "PUR-10001",
    supplier: "Tech Solutions Ltd",
    date: "15/03/2025",
    items: 10,
    totalAmount: "NGN 2,500,000.00",
    status: "Completed",
    paymentMethod: "Bank Transfer",
    referenceNumber: "INV-2025-001",
    purchasedBy: "John Doe",
    warehouse: "Main Warehouse",
    products: "Laptops (5), Monitors (5)",
    notes: "Annual IT equipment refresh",
  },
  {
    id: "PUR-10002",
    supplier: "Global Office Supplies",
    date: "20/03/2025",
    items: 25,
    totalAmount: "NGN 750,000.00",
    status: "Completed",
    paymentMethod: "Check",
    referenceNumber: "INV-2025-002",
    purchasedBy: "Jane Smith",
    warehouse: "Branch 1 Store",
    products: "Paper (10 boxes), Pens (15 boxes)",
    notes: "Monthly office supplies",
  },
  {
    id: "PUR-10003",
    supplier: "Premium Furniture Co.",
    date: "25/03/2025",
    items: 5,
    totalAmount: "NGN 1,200,000.00",
    status: "Completed",
    paymentMethod: "Bank Transfer",
    referenceNumber: "INV-2025-003",
    purchasedBy: "Mike Johnson",
    warehouse: "Main Warehouse",
    products: "Executive Desks (3), Conference Table (1), Chairs (1)",
    notes: "New executive office setup",
  },
  {
    id: "PUR-10004",
    supplier: "Tech Solutions Ltd",
    date: "01/04/2025",
    items: 15,
    totalAmount: "NGN 1,800,000.00",
    status: "Completed",
    paymentMethod: "Credit Card",
    referenceNumber: "INV-2025-004",
    purchasedBy: "John Doe",
    warehouse: "Branch 2 Store",
    products: "Printers (5), Scanners (5), Projectors (5)",
    notes: "Branch office equipment upgrade",
  },
  {
    id: "PUR-10005",
    supplier: "Industrial Equipment Inc.",
    date: "05/04/2025",
    items: 8,
    totalAmount: "NGN 950,000.00",
    status: "Pending",
    paymentMethod: "Bank Transfer",
    referenceNumber: "INV-2025-005",
    purchasedBy: "Sarah Williams",
    warehouse: "Main Warehouse",
    products: "Heavy Duty Shelving (8)",
    notes: "Warehouse storage expansion",
  },
]

export default function StockPurchasePage() {
  const [purchases, setPurchases] = useState(initialPurchases)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.warehouse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Form fields for Add/Edit Purchase - Fixed with additional fields
  const purchaseFields = [
    {
      name: "supplier",
      label: "Supplier",
      type: "select",
      required: true,
      options: [
        { value: "Tech Solutions Ltd", label: "Tech Solutions Ltd" },
        { value: "Global Office Supplies", label: "Global Office Supplies" },
        { value: "Premium Furniture Co.", label: "Premium Furniture Co." },
        { value: "Industrial Equipment Inc.", label: "Industrial Equipment Inc." },
        { value: "Office Depot", label: "Office Depot" },
      ],
    },
    { name: "date", label: "Purchase Date", type: "date", required: true },
    {
      name: "warehouse",
      label: "Destination Warehouse",
      type: "select",
      required: true,
      options: [
        { value: "Main Warehouse", label: "Main Warehouse" },
        { value: "Branch 1 Store", label: "Branch 1 Store" },
        { value: "Branch 2 Store", label: "Branch 2 Store" },
        { value: "Branch 3 Store", label: "Branch 3 Store" },
      ],
    },
    { name: "purchasedBy", label: "Purchased By", type: "text", required: true },
    { name: "items", label: "Number of Items", type: "number", required: true },
    {
      name: "products",
      label: "Products",
      type: "textarea",
      required: true,
      placeholder: "Enter product details (name, quantity, etc.)",
    },
    { name: "totalAmount", label: "Total Amount", type: "text", required: true },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      options: [
        { value: "Bank Transfer", label: "Bank Transfer" },
        { value: "Cash", label: "Cash" },
        { value: "Credit Card", label: "Credit Card" },
        { value: "Check", label: "Check" },
      ],
    },
    { name: "referenceNumber", label: "Invoice/Reference Number", type: "text", required: true },
    { name: "notes", label: "Notes", type: "textarea" },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "Pending", label: "Pending" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
  ]

  // Handle add purchase
  const handleAddPurchase = (data: any) => {
    const newPurchase = {
      id: `PUR-${10000 + purchases.length + 1}`,
      ...data,
    }
    setPurchases([...purchases, newPurchase])
    setIsAddModalOpen(false)
    toast({
      title: "Purchase Added",
      description: `Purchase from ${data.supplier} has been added successfully.`,
    })
  }

  // Handle edit purchase
  const handleEditPurchase = (data: any) => {
    setPurchases(
      purchases.map((purchase) => (purchase.id === currentPurchase.id ? { ...purchase, ...data } : purchase)),
    )
    setIsEditModalOpen(false)
    toast({
      title: "Purchase Updated",
      description: `Purchase from ${data.supplier} has been updated successfully.`,
    })
  }

  // Handle delete purchase
  const handleDeletePurchase = () => {
    setPurchases(purchases.filter((purchase) => purchase.id !== currentPurchase.id))
    setIsDeleteModalOpen(false)
    toast({
      title: "Purchase Deleted",
      description: `Purchase ${currentPurchase.id} has been deleted successfully.`,
    })
  }

  // Handle view purchase
  const handleViewPurchase = (purchase: any) => {
    setCurrentPurchase(purchase)
    setIsViewModalOpen(true)
  }

  // Handle edit purchase
  const handleEditPurchaseClick = (purchase: any) => {
    setCurrentPurchase(purchase)
    setIsEditModalOpen(true)
  }

  // Handle delete purchase
  const handleDeletePurchaseClick = (purchase: any) => {
    setCurrentPurchase(purchase)
    setIsDeleteModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2" />
          Stock Purchase Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Purchase
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search purchases..."
              className="pl-8 w-full"
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
                  Supplier
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
                  Items
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
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
                    <div className="text-sm font-medium text-gray-900">{purchase.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={purchase.status}
                      statusMap={{
                        Completed: "success",
                        Pending: "warning",
                        Cancelled: "error",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      onEdit={() => handleEditPurchaseClick(purchase)}
                      onView={() => handleViewPurchase(purchase)}
                      onDelete={() => handleDeletePurchaseClick(purchase)}
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
        title="New Purchase"
        mode="add"
        itemType="Stock Purchase"
        fields={purchaseFields}
        onSave={handleAddPurchase}
      />

      {/* Edit Purchase Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Purchase"
        mode="edit"
        itemType="Stock Purchase"
        fields={purchaseFields}
        initialData={currentPurchase}
        onSave={handleEditPurchase}
      />

      {/* View Purchase Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Purchase Details"
        mode="view"
      >
        {currentPurchase && (
          <ViewDetails
            details={[
              { label: "Purchase ID", value: currentPurchase.id },
              { label: "Supplier", value: currentPurchase.supplier },
              { label: "Date", value: currentPurchase.date },
              { label: "Warehouse", value: currentPurchase.warehouse || "N/A" },
              { label: "Purchased By", value: currentPurchase.purchasedBy || "N/A" },
              { label: "Number of Items", value: currentPurchase.items },
              { label: "Products", value: currentPurchase.products || "N/A" },
              { label: "Total Amount", value: currentPurchase.totalAmount },
              { label: "Payment Method", value: currentPurchase.paymentMethod || "N/A" },
              { label: "Reference Number", value: currentPurchase.referenceNumber || "N/A" },
              { label: "Status", value: currentPurchase.status },
              { label: "Notes", value: currentPurchase.notes || "N/A" },
            ]}
          />
        )}
      </CrudModal>

      {/* Delete Confirmation Modal */}
      <CrudModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Purchase"
        mode="view"
      >
        {currentPurchase && (
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the purchase <strong>{currentPurchase.id}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePurchase}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </CrudModal>
    </div>
  )
}
