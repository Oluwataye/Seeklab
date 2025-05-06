"use client"

import { useState } from "react"
import { HardHat, Plus, Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/lib/hooks/use-toast"

export default function ContractorPage() {
  const { toast } = useToast()
  const [contractors, setContractors] = useState([
    {
      id: "CONT-1001",
      name: "Alpha Construction Ltd",
      serviceType: "Construction",
      contactPerson: "John Smith",
      phone: "+234 801 234 5678",
      email: "info@alphaconstruction.com",
      address: "15 Industrial Avenue, Lagos",
      status: "Active",
    },
    {
      id: "CONT-1002",
      name: "Beta Electrical Services",
      serviceType: "Electrical",
      contactPerson: "Sarah Johnson",
      phone: "+234 802 345 6789",
      email: "contact@betaelectrical.com",
      address: "27 Power Road, Abuja",
      status: "Active",
    },
    {
      id: "CONT-1003",
      name: "Gamma Plumbing Co.",
      serviceType: "Plumbing",
      contactPerson: "Michael Brown",
      phone: "+234 803 456 7890",
      email: "support@gammaplumbing.com",
      address: "8 Water Lane, Port Harcourt",
      status: "Active",
    },
    {
      id: "CONT-1004",
      name: "Delta Security Systems",
      serviceType: "Security",
      contactPerson: "Emily Davis",
      phone: "+234 804 567 8901",
      email: "info@deltasecurity.com",
      address: "42 Safety Street, Lagos",
      status: "Inactive",
    },
    {
      id: "CONT-1005",
      name: "Epsilon IT Solutions",
      serviceType: "IT Services",
      contactPerson: "Robert Wilson",
      phone: "+234 805 678 9012",
      email: "support@epsilonit.com",
      address: "11 Tech Boulevard, Lagos",
      status: "Active",
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentContractor, setCurrentContractor] = useState<any>(null)

  const handleAdd = (data: any) => {
    const newId = `CONT-${1000 + contractors.length + 1}`
    const newContractor = {
      id: newId,
      ...data,
    }
    setContractors([...contractors, newContractor])
    setIsAddModalOpen(false)
    toast({
      title: "Success",
      description: "Contractor added successfully",
    })
  }

  const handleEdit = (data: any) => {
    setContractors(
      contractors.map((contractor) =>
        contractor.id === currentContractor.id ? { ...contractor, ...data } : contractor,
      ),
    )
    setIsEditModalOpen(false)
    toast({
      title: "Success",
      description: "Contractor updated successfully",
    })
  }

  const handleDelete = () => {
    setContractors(contractors.filter((contractor) => contractor.id !== currentContractor.id))
    setIsDeleteModalOpen(false)
    toast({
      title: "Success",
      description: "Contractor deleted successfully",
    })
  }

  const addFields = [
    { name: "name", label: "Company Name", type: "text", required: true },
    { name: "serviceType", label: "Service Type", type: "text", required: true },
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
          <HardHat className="h-5 w-5 mr-2" />
          Contractor Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Contractor
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
                  Contractor ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Service Type
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
              {contractors.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contractor.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contractor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contractor.serviceType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contractor.contactPerson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contractor.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={contractor.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 mr-1"
                      onClick={() => {
                        setCurrentContractor(contractor)
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
                        setCurrentContractor(contractor)
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
                        setCurrentContractor(contractor)
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

      {/* Add Contractor Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Contractor"
        fields={addFields}
        onSubmit={handleAdd}
        submitLabel="Add Contractor"
      />

      {/* Edit Contractor Modal */}
      {currentContractor && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Contractor"
          fields={addFields}
          initialValues={currentContractor}
          onSubmit={handleEdit}
          submitLabel="Update Contractor"
        />
      )}

      {/* View Contractor Modal */}
      {currentContractor && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Contractor Details"
          details={[
            { label: "Contractor ID", value: currentContractor.id },
            { label: "Company Name", value: currentContractor.name },
            { label: "Service Type", value: currentContractor.serviceType },
            { label: "Contact Person", value: currentContractor.contactPerson },
            { label: "Phone", value: currentContractor.phone },
            { label: "Email", value: currentContractor.email },
            { label: "Address", value: currentContractor.address },
            { label: "Status", value: currentContractor.status },
          ]}
        />
      )}

      {/* Delete Confirmation Modal */}
      {currentContractor && (
        <CrudModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Contractor"
          onSubmit={handleDelete}
          submitLabel="Delete Contractor"
          submitVariant="destructive"
          fields={[]}
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete contractor <span className="font-semibold">{currentContractor.name}</span>?
            This action cannot be undone.
          </p>
        </CrudModal>
      )}
    </div>
  )
}
