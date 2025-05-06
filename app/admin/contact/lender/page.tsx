"use client"

import { useState } from "react"
import { Briefcase, Plus, Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/lib/hooks/use-toast"

export default function LenderPage() {
  const { toast } = useToast()
  const [lenders, setLenders] = useState([
    {
      id: "LND-1001",
      name: "First Bank Nigeria",
      type: "Commercial Bank",
      contactPerson: "James Wilson",
      phone: "+234 901 234 5678",
      email: "jwilson@firstbank.com",
      address: "35 Marina, Lagos Island, Lagos",
      status: "Active",
    },
    {
      id: "LND-1002",
      name: "Zenith Bank",
      type: "Commercial Bank",
      contactPerson: "Mary Johnson",
      phone: "+234 902 345 6789",
      email: "mjohnson@zenithbank.com",
      address: "Plot 84, Ajose Adeogun Street, Victoria Island, Lagos",
      status: "Active",
    },
    {
      id: "LND-1003",
      name: "Access Bank",
      type: "Commercial Bank",
      contactPerson: "David Brown",
      phone: "+234 903 456 7890",
      email: "dbrown@accessbank.com",
      address: "Plot 999c, Danmole Street, Victoria Island, Lagos",
      status: "Inactive",
    },
    {
      id: "LND-1004",
      name: "UBA",
      type: "Commercial Bank",
      contactPerson: "Patricia Davis",
      phone: "+234 904 567 8901",
      email: "pdavis@uba.com",
      address: "57 Marina, Lagos Island, Lagos",
      status: "Active",
    },
    {
      id: "LND-1005",
      name: "GTBank",
      type: "Commercial Bank",
      contactPerson: "Thomas Clark",
      phone: "+234 905 678 9012",
      email: "tclark@gtbank.com",
      address: "635 Akin Adesola Street, Victoria Island, Lagos",
      status: "Active",
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentLender, setCurrentLender] = useState<any>(null)

  const handleAdd = (data: any) => {
    const newId = `LND-${1000 + lenders.length + 1}`
    const newLender = {
      id: newId,
      ...data,
    }
    setLenders([...lenders, newLender])
    setIsAddModalOpen(false)
    toast({
      title: "Success",
      description: "Lender added successfully",
    })
  }

  const handleEdit = (data: any) => {
    setLenders(lenders.map((lender) => (lender.id === currentLender.id ? { ...lender, ...data } : lender)))
    setIsEditModalOpen(false)
    toast({
      title: "Success",
      description: "Lender updated successfully",
    })
  }

  const handleDelete = () => {
    setLenders(lenders.filter((lender) => lender.id !== currentLender.id))
    setIsDeleteModalOpen(false)
    toast({
      title: "Success",
      description: "Lender deleted successfully",
    })
  }

  const addFields = [
    { name: "name", label: "Institution Name", type: "text", required: true },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: [
        { label: "Commercial Bank", value: "Commercial Bank" },
        { label: "Microfinance Bank", value: "Microfinance Bank" },
        { label: "Development Bank", value: "Development Bank" },
        { label: "Investment Bank", value: "Investment Bank" },
        { label: "Private Lender", value: "Private Lender" },
      ],
      required: true,
    },
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
        { label: "Inactive", value: "Inactive" },
      ],
      required: true,
    },
  ]

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Lender Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Lender
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
                  Lender ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Institution Name
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
                  Contact Person
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
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
              {lenders.map((lender) => (
                <tr key={lender.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lender.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lender.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lender.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lender.contactPerson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lender.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={lender.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 mr-1"
                      onClick={() => {
                        setCurrentLender(lender)
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
                        setCurrentLender(lender)
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
                        setCurrentLender(lender)
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

      {/* Add Lender Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Lender"
        fields={addFields}
        onSubmit={handleAdd}
        submitLabel="Add Lender"
      />

      {/* Edit Lender Modal */}
      {currentLender && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Lender"
          fields={addFields}
          initialValues={currentLender}
          onSubmit={handleEdit}
          submitLabel="Update Lender"
        />
      )}

      {/* View Lender Modal */}
      {currentLender && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Lender Details"
          details={[
            { label: "Lender ID", value: currentLender.id },
            { label: "Institution Name", value: currentLender.name },
            { label: "Type", value: currentLender.type },
            { label: "Contact Person", value: currentLender.contactPerson },
            { label: "Phone", value: currentLender.phone },
            { label: "Email", value: currentLender.email },
            { label: "Address", value: currentLender.address },
            { label: "Status", value: currentLender.status },
          ]}
        />
      )}

      {/* Delete Confirmation Modal */}
      {currentLender && (
        <CrudModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Lender"
          onSubmit={handleDelete}
          submitLabel="Delete Lender"
          submitVariant="destructive"
          fields={[]}
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete lender <span className="font-semibold">{currentLender.name}</span>? This
            action cannot be undone.
          </p>
        </CrudModal>
      )}
    </div>
  )
}
