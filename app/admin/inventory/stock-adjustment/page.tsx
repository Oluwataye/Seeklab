"use client"

import { useState } from "react"
import { Sliders, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { useToastContext } from "@/components/toast-provider"

// Mock data for demonstration
const mockAdjustments = [
  {
    id: 1,
    adjustmentId: "ADJ-10001",
    warehouse: "Main Warehouse",
    date: "20/03/2025",
    type: "Increase",
    items: "5",
    reason: "Inventory count",
    status: "Approved",
    notes: "Regular inventory count adjustment",
    products: [
      { id: 1, name: "Laptop", quantity: 2, currentStock: 15 },
      { id: 2, name: "Mouse", quantity: 3, currentStock: 25 },
    ],
  },
  {
    id: 2,
    adjustmentId: "ADJ-10002",
    warehouse: "Branch 1 Store",
    date: "22/03/2025",
    type: "Decrease",
    items: "3",
    reason: "Damaged goods",
    status: "Approved",
    notes: "Items damaged during transportation",
    products: [
      { id: 3, name: "Keyboard", quantity: 1, currentStock: 12 },
      { id: 4, name: "Monitor", quantity: 2, currentStock: 8 },
    ],
  },
  {
    id: 3,
    adjustmentId: "ADJ-10003",
    warehouse: "Branch 2 Store",
    date: "25/03/2025",
    type: "Increase",
    items: "8",
    reason: "Found items",
    status: "Approved",
    notes: "Items found during warehouse reorganization",
    products: [
      { id: 5, name: "Headphones", quantity: 5, currentStock: 30 },
      { id: 6, name: "Charger", quantity: 3, currentStock: 40 },
    ],
  },
  {
    id: 4,
    adjustmentId: "ADJ-10004",
    warehouse: "Main Warehouse",
    date: "28/03/2025",
    type: "Decrease",
    items: "2",
    reason: "Expired products",
    status: "Pending",
    notes: "Products past expiration date",
    products: [{ id: 7, name: "Printer Ink", quantity: 2, currentStock: 10 }],
  },
  {
    id: 5,
    adjustmentId: "ADJ-10005",
    warehouse: "Branch 3 Store",
    date: "30/03/2025",
    type: "Increase",
    items: "10",
    reason: "Inventory count",
    status: "Approved",
    notes: "Quarterly inventory adjustment",
    products: [
      { id: 8, name: "USB Drive", quantity: 6, currentStock: 50 },
      { id: 9, name: "HDMI Cable", quantity: 4, currentStock: 35 },
    ],
  },
]

// Mock data for warehouses and products
const warehouses = [
  { value: "main", label: "Main Warehouse" },
  { value: "branch1", label: "Branch 1 Store" },
  { value: "branch2", label: "Branch 2 Store" },
  { value: "branch3", label: "Branch 3 Store" },
]

const products = [
  { value: "1", label: "Laptop" },
  { value: "2", label: "Mouse" },
  { value: "3", label: "Keyboard" },
  { value: "4", label: "Monitor" },
  { value: "5", label: "Headphones" },
  { value: "6", label: "Charger" },
  { value: "7", label: "Printer Ink" },
  { value: "8", label: "USB Drive" },
  { value: "9", label: "HDMI Cable" },
]

const adjustmentReasons = [
  { value: "inventory_count", label: "Inventory count" },
  { value: "damaged_goods", label: "Damaged goods" },
  { value: "found_items", label: "Found items" },
  { value: "expired_products", label: "Expired products" },
  { value: "theft", label: "Theft" },
  { value: "other", label: "Other" },
]

export default function StockAdjustmentPage() {
  const { toast } = useToastContext()
  const [adjustments, setAdjustments] = useState(mockAdjustments)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentAdjustment, setCurrentAdjustment] = useState<any>(null)
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])

  // Function to handle adding a new adjustment
  const handleAddAdjustment = async (formData: FormData) => {
    const warehouse = formData.get("warehouse") as string
    const type = formData.get("type") as string
    const reason = formData.get("reason") as string
    const notes = formData.get("notes") as string
    const date = formData.get("date") as string

    // Create a new adjustment
    const newAdjustment = {
      id: adjustments.length + 1,
      adjustmentId: `ADJ-${10000 + adjustments.length + 1}`,
      warehouse: warehouses.find((w) => w.value === warehouse)?.label || warehouse,
      date: date || new Date().toLocaleDateString(),
      type,
      items: selectedProducts.length.toString(),
      reason: adjustmentReasons.find((r) => r.value === reason)?.label || reason,
      status: "Pending",
      notes,
      products: selectedProducts,
    }

    setAdjustments([...adjustments, newAdjustment])
    setSelectedProducts([])

    // Show success message
    toast.success("Stock Adjustment Added", "Stock adjustment has been successfully added.")
  }

  // Function to handle editing an adjustment
  const handleEditAdjustment = async (formData: FormData) => {
    const id = Number(currentAdjustment.id)
    const warehouse = formData.get("warehouse") as string
    const type = formData.get("type") as string
    const reason = formData.get("reason") as string
    const notes = formData.get("notes") as string
    const date = formData.get("date") as string
    const status = formData.get("status") as string

    // Update the adjustment
    const updatedAdjustments = adjustments.map((adjustment) => {
      if (adjustment.id === id) {
        return {
          ...adjustment,
          warehouse: warehouses.find((w) => w.value === warehouse)?.label || warehouse,
          date: date || adjustment.date,
          type,
          reason: adjustmentReasons.find((r) => r.value === reason)?.label || reason,
          status,
          notes,
          products: selectedProducts.length > 0 ? selectedProducts : adjustment.products,
        }
      }
      return adjustment
    })

    setAdjustments(updatedAdjustments)
    setSelectedProducts([])

    // Show success message
    toast.success("Stock Adjustment Updated", "Stock adjustment has been successfully updated.")
  }

  // Function to add a product to the selected products list
  const handleAddProduct = () => {
    const productSelect = document.getElementById("product") as HTMLSelectElement
    const quantityInput = document.getElementById("quantity") as HTMLInputElement

    if (productSelect && quantityInput && productSelect.value && quantityInput.value) {
      const productId = productSelect.value
      const productName = products.find((p) => p.value === productId)?.label || ""
      const quantity = Number.parseInt(quantityInput.value)

      // Check if product already exists in the list
      const existingProductIndex = selectedProducts.findIndex((p) => p.id.toString() === productId)

      if (existingProductIndex >= 0) {
        // Update existing product quantity
        const updatedProducts = [...selectedProducts]
        updatedProducts[existingProductIndex].quantity += quantity
        setSelectedProducts(updatedProducts)
      } else {
        // Add new product
        setSelectedProducts([
          ...selectedProducts,
          {
            id: Number.parseInt(productId),
            name: productName,
            quantity,
            currentStock: Math.floor(Math.random() * 50) + 10, // Mock current stock
          },
        ])
      }

      // Reset inputs
      productSelect.value = ""
      quantityInput.value = ""
    }
  }

  // Function to remove a product from the selected products list
  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId))
  }

  // Function to handle view action
  const handleView = (adjustment: any) => {
    setCurrentAdjustment(adjustment)
    setIsViewModalOpen(true)
  }

  // Function to handle edit action
  const handleEdit = (adjustment: any) => {
    setCurrentAdjustment(adjustment)
    setSelectedProducts(adjustment.products || [])
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Sliders className="h-5 w-5 mr-2" />
          Stock Adjustment Management
        </h1>
        <Button
          className="bg-white text-red-600 hover:bg-gray-100"
          onClick={() => {
            setSelectedProducts([])
            setIsAddModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> New Adjustment
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Adjustment ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Warehouse
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
                  Type
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
                  Reason
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
              {adjustments.map((adjustment) => (
                <tr key={adjustment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adjustment.adjustmentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{adjustment.warehouse}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adjustment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adjustment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adjustment.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adjustment.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        adjustment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {adjustment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions onEdit={() => handleEdit(adjustment)} onView={() => handleView(adjustment)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Adjustment Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Stock Adjustment"
        mode="add"
        itemType="Stock Adjustment"
        onSubmit={handleAddAdjustment}
      >
        <div className="space-y-4">
          {/* Warehouse Selection */}
          <div className="space-y-2">
            <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700">
              Warehouse <span className="text-red-500">*</span>
            </label>
            <select
              id="warehouse"
              name="warehouse"
              required
              defaultValue=""
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>
                Select Warehouse
              </option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.value} value={warehouse.value}>
                  {warehouse.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Adjustment Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue=""
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              required
              defaultValue=""
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>
                Select Reason
              </option>
              {adjustmentReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>

          {/* Product Selection */}
          <div className="space-y-2 border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900">Add Products</h3>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                  Product
                </label>
                <select
                  id="product"
                  defaultValue=""
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                >
                  <option value="" disabled>
                    Select Product
                  </option>
                  {products.map((product) => (
                    <option key={product.value} value={product.value}>
                      {product.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleAddProduct} className="bg-red-600 text-white hover:bg-red-700">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Selected Products Table */}
          {selectedProducts.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Products</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Current Stock
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.currentStock}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CrudModal>

      {/* Edit Adjustment Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Stock Adjustment"
        mode="edit"
        itemType="Stock Adjustment"
        onSubmit={handleEditAdjustment}
        initialData={currentAdjustment}
      >
        {currentAdjustment && (
          <div className="space-y-4">
            {/* Warehouse Selection */}
            <div className="space-y-2">
              <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                id="warehouse"
                name="warehouse"
                required
                defaultValue={warehouses.find((w) => w.label === currentAdjustment.warehouse)?.value || ""}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select Warehouse
                </option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.value} value={warehouse.value}>
                    {warehouse.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                defaultValue={
                  currentAdjustment.date
                    ? new Date(currentAdjustment.date.split("/").reverse().join("-")).toISOString().split("T")[0]
                    : ""
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            {/* Adjustment Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Adjustment Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                defaultValue={currentAdjustment.type}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="Increase">Increase</option>
                <option value="Decrease">Decrease</option>
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                id="reason"
                name="reason"
                required
                defaultValue={adjustmentReasons.find((r) => r.label === currentAdjustment.reason)?.value || ""}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select Reason
                </option>
                {adjustmentReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue={currentAdjustment.status}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={currentAdjustment.notes}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            {/* Product Selection */}
            <div className="space-y-2 border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900">Add Products</h3>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <select
                    id="product"
                    defaultValue=""
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    <option value="" disabled>
                      Select Product
                    </option>
                    {products.map((product) => (
                      <option key={product.value} value={product.value}>
                        {product.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-1/4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={handleAddProduct} className="bg-red-600 text-white hover:bg-red-700">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Selected Products Table */}
            {selectedProducts.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Products</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Current Stock
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.currentStock}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CrudModal>

      {/* View Adjustment Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Stock Adjustment"
        mode="view"
        itemType="Stock Adjustment"
      >
        {currentAdjustment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ViewDetails label="Adjustment ID" value={currentAdjustment.adjustmentId} />
              <ViewDetails label="Warehouse" value={currentAdjustment.warehouse} />
              <ViewDetails label="Date" value={currentAdjustment.date} />
              <ViewDetails label="Type" value={currentAdjustment.type} />
              <ViewDetails label="Reason" value={currentAdjustment.reason} />
              <ViewDetails
                label="Status"
                value={
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      currentAdjustment.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : currentAdjustment.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentAdjustment.status}
                  </span>
                }
              />
            </div>

            <div>
              <ViewDetails label="Notes" value={currentAdjustment.notes} />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Products</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Current Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentAdjustment.products &&
                      currentAdjustment.products.map((product: any) => (
                        <tr key={product.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.currentStock}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CrudModal>
    </div>
  )
}
