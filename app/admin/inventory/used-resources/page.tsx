"use client"

import { useState } from "react"
import { Recycle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { useToastContext } from "@/components/toast-provider"

// Mock data for demonstration
const mockResources = [
  {
    id: 1,
    resourceId: "RES-10001",
    product: "Printer Paper A4",
    department: "Administration",
    quantity: "5 reams",
    dateUsed: "15/03/2025",
    requestedBy: "John Smith",
    purpose: "Monthly reports printing",
    approvedBy: "Jane Doe",
    status: "Approved",
  },
  {
    id: 2,
    resourceId: "RES-10002",
    product: "Ink Cartridges",
    department: "IT",
    quantity: "3 units",
    dateUsed: "18/03/2025",
    requestedBy: "Sarah Johnson",
    purpose: "Printer maintenance",
    approvedBy: "Michael Brown",
    status: "Approved",
  },
  {
    id: 3,
    resourceId: "RES-10003",
    product: "Staples",
    department: "Finance",
    quantity: "2 boxes",
    dateUsed: "20/03/2025",
    requestedBy: "Michael Brown",
    purpose: "Document binding",
    approvedBy: "Robert Wilson",
    status: "Approved",
  },
  {
    id: 4,
    resourceId: "RES-10004",
    product: "Sticky Notes",
    department: "Marketing",
    quantity: "10 packs",
    dateUsed: "25/03/2025",
    requestedBy: "Emily Davis",
    purpose: "Campaign planning",
    approvedBy: "Pending",
    status: "Pending",
  },
  {
    id: 5,
    resourceId: "RES-10005",
    product: "Pens",
    department: "HR",
    quantity: "20 units",
    dateUsed: "28/03/2025",
    requestedBy: "Robert Wilson",
    purpose: "New hire onboarding",
    approvedBy: "Jane Doe",
    status: "Approved",
  },
]

// Mock data for departments and products
const departments = [
  { value: "administration", label: "Administration" },
  { value: "it", label: "IT" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "hr", label: "HR" },
  { value: "operations", label: "Operations" },
  { value: "sales", label: "Sales" },
]

const products = [
  { value: "printer_paper", label: "Printer Paper A4" },
  { value: "ink_cartridges", label: "Ink Cartridges" },
  { value: "staples", label: "Staples" },
  { value: "sticky_notes", label: "Sticky Notes" },
  { value: "pens", label: "Pens" },
  { value: "notebooks", label: "Notebooks" },
  { value: "folders", label: "Folders" },
  { value: "paper_clips", label: "Paper Clips" },
  { value: "highlighters", label: "Highlighters" },
]

const employees = [
  { value: "john_smith", label: "John Smith" },
  { value: "sarah_johnson", label: "Sarah Johnson" },
  { value: "michael_brown", label: "Michael Brown" },
  { value: "emily_davis", label: "Emily Davis" },
  { value: "robert_wilson", label: "Robert Wilson" },
  { value: "jane_doe", label: "Jane Doe" },
]

export default function UsedResourcesPage() {
  const { toast } = useToastContext()
  const [resources, setResources] = useState(mockResources)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentResource, setCurrentResource] = useState<any>(null)

  // Function to handle adding a new resource
  const handleAddResource = async (formData: FormData) => {
    const product = formData.get("product") as string
    const department = formData.get("department") as string
    const quantity = formData.get("quantity") as string
    const unit = formData.get("unit") as string
    const dateUsed = formData.get("dateUsed") as string
    const requestedBy = formData.get("requestedBy") as string
    const purpose = formData.get("purpose") as string

    // Create a new resource
    const newResource = {
      id: resources.length + 1,
      resourceId: `RES-${10000 + resources.length + 1}`,
      product: products.find((p) => p.value === product)?.label || product,
      department: departments.find((d) => d.value === department)?.label || department,
      quantity: `${quantity} ${unit}`,
      dateUsed: dateUsed || new Date().toLocaleDateString(),
      requestedBy: employees.find((e) => e.value === requestedBy)?.label || requestedBy,
      purpose,
      approvedBy: "Pending",
      status: "Pending",
    }

    setResources([...resources, newResource])

    // Show success message
    toast.success("Used Resource Added", "Used resource has been successfully added.")
  }

  // Function to handle editing a resource
  const handleEditResource = async (formData: FormData) => {
    const id = Number(currentResource.id)
    const product = formData.get("product") as string
    const department = formData.get("department") as string
    const quantity = formData.get("quantity") as string
    const unit = formData.get("unit") as string
    const dateUsed = formData.get("dateUsed") as string
    const requestedBy = formData.get("requestedBy") as string
    const purpose = formData.get("purpose") as string
    const status = formData.get("status") as string
    const approvedBy = formData.get("approvedBy") as string

    // Update the resource
    const updatedResources = resources.map((resource) => {
      if (resource.id === id) {
        return {
          ...resource,
          product: products.find((p) => p.value === product)?.label || product,
          department: departments.find((d) => d.value === department)?.label || department,
          quantity: `${quantity} ${unit}`,
          dateUsed: dateUsed || resource.dateUsed,
          requestedBy: employees.find((e) => e.value === requestedBy)?.label || requestedBy,
          purpose,
          status,
          approvedBy: status === "Approved" ? approvedBy || resource.approvedBy : "Pending",
        }
      }
      return resource
    })

    setResources(updatedResources)

    // Show success message
    toast.success("Used Resource Updated", "Used resource has been successfully updated.")
  }

  // Function to handle view action
  const handleView = (resource: any) => {
    setCurrentResource(resource)
    setIsViewModalOpen(true)
  }

  // Function to handle edit action
  const handleEdit = (resource: any) => {
    setCurrentResource(resource)
    setIsEditModalOpen(true)
  }

  // Helper function to extract quantity and unit
  const extractQuantityAndUnit = (quantityString: string) => {
    const parts = quantityString.split(" ")
    return {
      quantity: parts[0],
      unit: parts.slice(1).join(" "),
    }
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Recycle className="h-5 w-5 mr-2" />
          Used Resources Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Used Resource
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
                  Resource ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Used
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Requested By
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
              {resources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.resourceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{resource.product}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.dateUsed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.requestedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        resource.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {resource.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions onEdit={() => handleEdit(resource)} onView={() => handleView(resource)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resource Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Used Resource"
        mode="add"
        itemType="Used Resource"
        onSubmit={handleAddResource}
      >
        <div className="space-y-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <label htmlFor="product" className="block text-sm font-medium text-gray-700">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              id="product"
              name="product"
              required
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

          {/* Department Selection */}
          <div className="space-y-2">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="department"
              name="department"
              required
              defaultValue=""
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>
                Select Department
              </option>
              {departments.map((department) => (
                <option key={department.value} value={department.value}>
                  {department.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                id="unit"
                name="unit"
                required
                defaultValue=""
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select Unit
                </option>
                <option value="units">Units</option>
                <option value="boxes">Boxes</option>
                <option value="reams">Reams</option>
                <option value="packs">Packs</option>
                <option value="cartons">Cartons</option>
                <option value="sets">Sets</option>
              </select>
            </div>
          </div>

          {/* Date Used */}
          <div className="space-y-2">
            <label htmlFor="dateUsed" className="block text-sm font-medium text-gray-700">
              Date Used <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateUsed"
              name="dateUsed"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>

          {/* Requested By */}
          <div className="space-y-2">
            <label htmlFor="requestedBy" className="block text-sm font-medium text-gray-700">
              Requested By <span className="text-red-500">*</span>
            </label>
            <select
              id="requestedBy"
              name="requestedBy"
              required
              defaultValue=""
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>
                Select Employee
              </option>
              {employees.map((employee) => (
                <option key={employee.value} value={employee.value}>
                  {employee.label}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
              Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              id="purpose"
              name="purpose"
              required
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
        </div>
      </CrudModal>

      {/* Edit Resource Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Used Resource"
        mode="edit"
        itemType="Used Resource"
        onSubmit={handleEditResource}
        initialData={currentResource}
      >
        {currentResource && (
          <div className="space-y-4">
            {/* Product Selection */}
            <div className="space-y-2">
              <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                id="product"
                name="product"
                required
                defaultValue={products.find((p) => p.label === currentResource.product)?.value || ""}
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

            {/* Department Selection */}
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department"
                name="department"
                required
                defaultValue={departments.find((d) => d.label === currentResource.department)?.value || ""}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select Department
                </option>
                {departments.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  required
                  defaultValue={extractQuantityAndUnit(currentResource.quantity).quantity}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  id="unit"
                  name="unit"
                  required
                  defaultValue={extractQuantityAndUnit(currentResource.quantity).unit}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                >
                  <option value="" disabled>
                    Select Unit
                  </option>
                  <option value="units">Units</option>
                  <option value="boxes">Boxes</option>
                  <option value="reams">Reams</option>
                  <option value="packs">Packs</option>
                  <option value="cartons">Cartons</option>
                  <option value="sets">Sets</option>
                </select>
              </div>
            </div>

            {/* Date Used */}
            <div className="space-y-2">
              <label htmlFor="dateUsed" className="block text-sm font-medium text-gray-700">
                Date Used <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateUsed"
                name="dateUsed"
                required
                defaultValue={
                  currentResource.dateUsed
                    ? new Date(currentResource.dateUsed.split("/").reverse().join("-")).toISOString().split("T")[0]
                    : ""
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            {/* Requested By */}
            <div className="space-y-2">
              <label htmlFor="requestedBy" className="block text-sm font-medium text-gray-700">
                Requested By <span className="text-red-500">*</span>
              </label>
              <select
                id="requestedBy"
                name="requestedBy"
                required
                defaultValue={employees.find((e) => e.label === currentResource.requestedBy)?.value || ""}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((employee) => (
                  <option key={employee.value} value={employee.value}>
                    {employee.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                id="purpose"
                name="purpose"
                required
                defaultValue={currentResource.purpose}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
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
                defaultValue={currentResource.status}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Approved By (only shown if status is Approved) */}
            <div className="space-y-2" id="approvedByContainer">
              <label htmlFor="approvedBy" className="block text-sm font-medium text-gray-700">
                Approved By {currentResource.status === "Approved" && <span className="text-red-500">*</span>}
              </label>
              <select
                id="approvedBy"
                name="approvedBy"
                required={currentResource.status === "Approved"}
                defaultValue={employees.find((e) => e.label === currentResource.approvedBy)?.value || ""}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((employee) => (
                  <option key={employee.value} value={employee.value}>
                    {employee.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </CrudModal>

      {/* View Resource Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Used Resource"
        mode="view"
        itemType="Used Resource"
      >
        {currentResource && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ViewDetails label="Resource ID" value={currentResource.resourceId} />
              <ViewDetails label="Product" value={currentResource.product} />
              <ViewDetails label="Department" value={currentResource.department} />
              <ViewDetails label="Quantity" value={currentResource.quantity} />
              <ViewDetails label="Date Used" value={currentResource.dateUsed} />
              <ViewDetails label="Requested By" value={currentResource.requestedBy} />
              <ViewDetails
                label="Status"
                value={
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      currentResource.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : currentResource.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentResource.status}
                  </span>
                }
              />
              {currentResource.status === "Approved" && (
                <ViewDetails label="Approved By" value={currentResource.approvedBy} />
              )}
            </div>

            <div>
              <ViewDetails label="Purpose" value={currentResource.purpose} />
            </div>
          </div>
        )}
      </CrudModal>
    </div>
  )
}
