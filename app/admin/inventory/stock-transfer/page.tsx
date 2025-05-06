"use client"

import { useState } from "react"
import { ArrowLeftRight, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/lib/hooks/use-toast"

// Mock data for stock transfers
const initialTransfers = [
  {
    id: "TRN-10001",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Branch 1 Store",
    date: "18/03/2025",
    items: 15,
    status: "Completed",
    products: "Laptops (5), Monitors (10)",
    referenceNumber: "REF-001",
    transferredBy: "John Doe",
    receivedBy: "Jane Smith",
    notes: "Regular monthly transfer",
  },
  {
    id: "TRN-10002",
    fromWarehouse: "Branch 1 Store",
    toWarehouse: "Branch 2 Store",
    date: "22/03/2025",
    items: 8,
    status: "Completed",
    products: "Office Chairs (8)",
    referenceNumber: "REF-002",
    transferredBy: "Jane Smith",
    receivedBy: "Mike Johnson",
    notes: "Urgent transfer for new office setup",
  },
  {
    id: "TRN-10003",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Branch 3 Store",
    date: "25/03/2025",
    items: 12,
    status: "Completed",
    products: "Printers (2), Paper Reams (10)",
    referenceNumber: "REF-003",
    transferredBy: "John Doe",
    receivedBy: "Sarah Williams",
    notes: "",
  },
  {
    id: "TRN-10004",
    fromWarehouse: "Branch 2 Store",
    toWarehouse: "Main Warehouse",
    date: "28/03/2025",
    items: 5,
    status: "Completed",
    products: "Damaged Laptops (5)",
    referenceNumber: "REF-004",
    transferredBy: "Mike Johnson",
    receivedBy: "John Doe",
    notes: "Return of damaged items for repair",
  },
  {
    id: "TRN-10005",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Branch 1 Store",
    date: "02/04/2025",
    items: 20,
    status: "In Transit",
    products: "Desks (5), Chairs (10), Filing Cabinets (5)",
    referenceNumber: "REF-005",
    transferredBy: "John Doe",
    receivedBy: "Pending",
    notes: "Large transfer for office expansion",
  },
]

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState(initialTransfers)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentTransfer, setCurrentTransfer] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Filter transfers based on search term
  const filteredTransfers = transfers.filter(
    (transfer) =>
      transfer.fromWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Form fields for Add/Edit Transfer - Fixed with additional fields
  const transferFields = [
    {
      name: "fromWarehouse",
      label: "From Warehouse",
      type: "select",
      required: true,
      options: [
        { value: "Main Warehouse", label: "Main Warehouse" },
        { value: "Branch 1 Store", label: "Branch 1 Store" },
        { value: "Branch 2 Store", label: "Branch 2 Store" },
        { value: "Branch 3 Store", label: "Branch 3 Store" },
      ],
    },
    {
      name: "toWarehouse",
      label: "To Warehouse",
      type: "select",
      required: true,
      options: [
        { value: "Main Warehouse", label: "Main Warehouse" },
        { value: "Branch 1 Store", label: "Branch 1 Store" },
        { value: "Branch 2 Store", label: "Branch 2 Store" },
        { value: "Branch 3 Store", label: "Branch 3 Store" },
      ],
    },
    { name: "date", label: "Transfer Date", type: "date", required: true },
    { name: "referenceNumber", label: "Reference Number", type: "text", required: true },
    { name: "transferredBy", label: "Transferred By", type: "text", required: true },
    { name: "receivedBy", label: "Received By", type: "text", required: true },
    { name: "items", label: "Number of Items", type: "number", required: true },
    {
      name: "products",
      label: "Products",
      type: "textarea",
      required: true,
      placeholder: "Enter product details (name, quantity, etc.)",
    },
    { name: "notes", label: "Notes", type: "textarea" },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "Pending", label: "Pending" },
        { value: "In Transit", label: "In Transit" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
  ]

  // Handle add transfer
  const handleAddTransfer = (data: any) => {
    // Validate that from and to warehouses are not the same
    if (data.fromWarehouse === data.toWarehouse) {
      toast({
        title: "Error",
        description: "From and To warehouses cannot be the same.",
        variant: "destructive",
      })
      return
    }

    const newTransfer = {
      id: `TRN-${10000 + transfers.length + 1}`,
      ...data,
    }
    setTransfers([...transfers, newTransfer])
    setIsAddModalOpen(false)
    toast({
      title: "Transfer Added",
      description: `Stock transfer from ${data.fromWarehouse} to ${data.toWarehouse} has been added successfully.`,
    })
  }

  // Handle edit transfer
  const handleEditTransfer = (data: any) => {
    // Validate that from and to warehouses are not the same
    if (data.fromWarehouse === data.toWarehouse) {
      toast({
        title: "Error",
        description: "From and To warehouses cannot be the same.",
        variant: "destructive",
      })
      return
    }

    setTransfers(
      transfers.map((transfer) => (transfer.id === currentTransfer.id ? { ...transfer, ...data } : transfer)),
    )
    setIsEditModalOpen(false)
    toast({
      title: "Transfer Updated",
      description: `Stock transfer ${currentTransfer.id} has been updated successfully.`,
    })
  }

  // Handle delete transfer
  const handleDeleteTransfer = () => {
    setTransfers(transfers.filter((transfer) => transfer.id !== currentTransfer.id))
    setIsDeleteModalOpen(false)
    toast({
      title: "Transfer Deleted",
      description: `Stock transfer ${currentTransfer.id} has been deleted successfully.`,
    })
  }

  // Handle view transfer
  const handleViewTransfer = (transfer: any) => {
    setCurrentTransfer(transfer)
    setIsViewModalOpen(true)
  }

  // Handle edit transfer
  const handleEditTransferClick = (transfer: any) => {
    setCurrentTransfer(transfer)
    setIsEditModalOpen(true)
  }

  // Handle delete transfer
  const handleDeleteTransferClick = (transfer: any) => {
    setCurrentTransfer(transfer)
    setIsDeleteModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <ArrowLeftRight className="h-5 w-5 mr-2" />
          Stock Transfer Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Transfer
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search transfers..."
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
                  Transfer ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  From Warehouse
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  To Warehouse
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
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transfer.fromWarehouse}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.toWarehouse}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={transfer.status}
                      statusMap={{
                        Completed: "success",
                        "In Transit": "warning",
                        Pending: "info",
                        Cancelled: "error",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      onEdit={() => handleEditTransferClick(transfer)}
                      onView={() => handleViewTransfer(transfer)}
                      onDelete={() => handleDeleteTransferClick(transfer)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transfer Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="New Transfer"
        mode="add"
        itemType="Stock Transfer"
        fields={transferFields}
        onSave={handleAddTransfer}
      />

      {/* Edit Transfer Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Transfer"
        mode="edit"
        itemType="Stock Transfer"
        fields={transferFields}
        initialData={currentTransfer}
        onSave={handleEditTransfer}
      />

      {/* View Transfer Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Transfer Details"
        mode="view"
      >
        {currentTransfer && (
          <ViewDetails
            details={[
              { label: "Transfer ID", value: currentTransfer.id },
              { label: "From Warehouse", value: currentTransfer.fromWarehouse },
              { label: "To Warehouse", value: currentTransfer.toWarehouse },
              { label: "Date", value: currentTransfer.date },
              { label: "Reference Number", value: currentTransfer.referenceNumber || "N/A" },
              { label: "Transferred By", value: currentTransfer.transferredBy || "N/A" },
              { label: "Received By", value: currentTransfer.receivedBy || "N/A" },
              { label: "Number of Items", value: currentTransfer.items },
              { label: "Products", value: currentTransfer.products || "N/A" },
              { label: "Status", value: currentTransfer.status },
              { label: "Notes", value: currentTransfer.notes || "N/A" },
            ]}
          />
        )}
      </CrudModal>

      {/* Delete Confirmation Modal */}
      <CrudModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Transfer"
        mode="view"
      >
        {currentTransfer && (
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the stock transfer <strong>{currentTransfer.id}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTransfer}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </CrudModal>
    </div>
  )
}
