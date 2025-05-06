"use client"

import { useState } from "react"
import { Truck, Plus, Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/lib/hooks/use-toast"

export default function SupplierPage() {
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState([
    {
      id: "SUP-1001",
      name: "Global Office Supplies",
      category: "Office Supplies",
      contactPerson: "Richard Taylor",
      phone: "+234 701 234 5678",
      email: "rtaylor@globalsupplies.com",
      address: "25 Commerce Avenue, Lagos",
      status: "Active",
    },
    {
      id: "SUP-1002",
      name: "Tech Solutions Ltd",
      category: "IT Equipment",
      contactPerson: "Jennifer Adams",
      phone: "+234 702 345 6789",
      email: "jadams@techsolutions.com",
      address: "10 Technology Drive, Abuja",
      status: "On Hold",
    },
    {
      id: "SUP-1003",
      name: "Premium Furniture Co.",
      category: "Furniture",
      contactPerson: "Christopher Lee",
      phone: "+234 703 456 7890",
      email: "clee@premiumfurniture.com",
      address: "5 Industrial Way, Port Harcourt",
      status: "Active",
    },
    {
      id: "SUP-1004",
      name: "Industrial Equipment Inc.",
      category: "Industrial",
      contactPerson: "Elizabeth White",
      phone: "+234 704 567 8901",
      email: "ewhite@industrialequip.com",
      address: "18 Factory Road, Kano",
      status: "Active",
    },
    {
      id: "SUP-1005",
      name: "Quality Paper Products",
      category: "Paper Products",
      contactPerson: "Daniel Martin",
      phone: "+234 705 678 9012",
      email: "dmartin@qualitypaper.com",
      address: "7 Print Street, Lagos",
      status: "Active",
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState<any>(null)

  const handleAdd = (data: any) => {
    const newId = `SUP-${1000 + suppliers.length + 1}`
    const newSupplier = {
      id: newId,
      ...data,
    }
    setSuppliers([...suppliers, newSupplier])
    setIsAddModalOpen(false)
    toast({
      title: "Success",
      description: "Supplier added successfully",
    })
  }

  const handleEdit = (data: any) => {
    setSuppliers(
      suppliers.map((supplier) => (supplier.id === currentSupplier.id ? { ...supplier, ...data } : supplier)),
    )
    setIsEditModalOpen(false)
    toast({
      title: "Success",
      description: "Supplier updated successfully",
    })
  }

  const handleDelete = () => {
    setSuppliers(suppliers.filter((supplier) => supplier.id !== currentSupplier.id))
    setIsDeleteModalOpen(false)
    toast({
      title: "Success",
      description: "Supplier deleted successfully",
    })
  }

  const addFields = [
    { name: "name", label: "Company Name", type: "text", required: true },
    { name: "category", label: "Category", type: "text", required: true },
    { name: "contactPerson", label: "Contact Person", type: "text", required: true },
    { name: "phone", label: "Phone Number", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "address", label: "Address", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "On Hold", value: "On Hold" },
        { label: "Inactive", value: "Inactive" },
      ],
      required: true,
    },
  ]

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Truck className="h-5 w-5 mr-2" />
          Supplier Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Supplier
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
                  Supplier ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Company Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact Person
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone
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
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactPerson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={supplier.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 mr-1"
                      onClick={() => {
                        setCurrentSupplier(supplier)
                        setIsEditModalOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 mr-1"
                      onClick={() => {
                        setCurrentSupplier(supplier)
                        setIsViewModalOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900 hover:bg-red-50"
                      onClick={() => {
                        setCurrentSupplier(supplier)
                        setIsDeleteModalOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Supplier"
        fields={addFields}
        onSubmit={handleAdd}
        submitLabel="Add Supplier"
      />

      {/* Edit Supplier Modal */}
      {currentSupplier && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Supplier"
          fields={addFields}
          initialValues={currentSupplier}
          onSubmit={handleEdit}
          submitLabel="Update Supplier"
        />
      )}

      {/* View Supplier Modal */}
      {currentSupplier && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Supplier Details"
          details={[
            { label: "Supplier ID", value: currentSupplier.id },
            { label: "Company Name", value: currentSupplier.name },
            { label: "Category", value: currentSupplier.category },
            { label: "Contact Person", value: currentSupplier.contactPerson },
            { label: "Phone", value: currentSupplier.phone },
            { label: "Email", value: currentSupplier.email },
            { label: "Address", value: currentSupplier.address },
            { label: "Status", value: currentSupplier.status },
          ]}
        />
      )}

      {/* Delete Confirmation Modal */}
      {currentSupplier && (
        <CrudModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Supplier"
          onSubmit={handleDelete}
          submitLabel="Delete Supplier"
          submitVariant="destructive"
          fields={[]}
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete supplier <span className="font-semibold">{currentSupplier.name}</span>? This
            action cannot be undone.
          </p>
        </CrudModal>
      )}
    </div>
  )
}
