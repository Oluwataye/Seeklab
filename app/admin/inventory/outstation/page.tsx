"use client"

import { useState } from "react"
import { WarehouseIcon, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"

// Sample data for outstations
const initialOutstations = [
  {
    id: "OS-101",
    name: "Main Outstation",
    location: "Lagos HQ",
    manager: "John Smith",
    deputyManager: "David Johnson",
    capacity: "5000 sqm",
    status: "active",
  },
  {
    id: "OS-102",
    name: "Branch 1 Store",
    location: "Abuja Branch",
    manager: "Sarah Johnson",
    deputyManager: "Michael Williams",
    capacity: "1200 sqm",
    status: "active",
  },
  {
    id: "OS-103",
    name: "Branch 2 Store",
    location: "Port Harcourt Branch",
    manager: "Michael Brown",
    deputyManager: "Jessica Davis",
    capacity: "1500 sqm",
    status: "maintenance",
  },
  {
    id: "OS-104",
    name: "Branch 3 Store",
    location: "Kano Branch",
    manager: "Emily Davis",
    deputyManager: "Robert Wilson",
    capacity: "1000 sqm",
    status: "active",
  },
]

export default function OutstationPage() {
  const [outstations, setOutstations] = useState(initialOutstations)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentOutstation, setCurrentOutstation] = useState<any>(null)

  // Filter outstations based on search term
  const filteredOutstations = outstations.filter(
    (outstation) =>
      outstation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outstation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outstation.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outstation.deputyManager.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Update the handleAddOutstation function to properly handle form data
  const handleAddOutstation = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    const newOutstation = {
      id: `OS-${105 + outstations.length}`,
      ...data,
    }

    setOutstations([...outstations, newOutstation])
    setIsAddModalOpen(false)
  }

  // Update the handleEditOutstation function to properly handle form data
  const handleEditOutstation = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    setOutstations(
      outstations.map((outstation) =>
        outstation.id === currentOutstation.id ? { ...outstation, ...data } : outstation,
      ),
    )

    setIsEditModalOpen(false)
  }

  // Handle delete outstation
  const handleDeleteOutstation = (id: string) => {
    setOutstations(outstations.filter((outstation) => outstation.id !== id))
  }

  // Handle view outstation
  const handleViewOutstation = (outstation: any) => {
    setCurrentOutstation(outstation)
    setIsViewModalOpen(true)
  }

  // Handle edit outstation
  const handleEditOutstationClick = (outstation: any) => {
    setCurrentOutstation(outstation)
    setIsEditModalOpen(true)
  }

  // Form fields for add/edit modal - Updated to include Deputy Field Officer
  const formFields = [
    { name: "name", label: "Outstation Name", type: "text", required: true },
    { name: "location", label: "Location", type: "text", required: true },
    { name: "manager", label: "Field Officer", type: "text", required: true },
    { name: "deputyManager", label: "Deputy Field Officer", type: "text", required: true }, // Added Deputy Field Officer
    { name: "capacity", label: "Project", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "maintenance", label: "Under Maintenance" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <WarehouseIcon className="h-5 w-5 mr-2" />
          Outstation Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Outstation
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search outstations..."
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
                  Outstation ID
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
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Field Officer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Deputy Field Officer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Project
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
              {filteredOutstations.map((outstation) => (
                <tr key={outstation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outstation.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{outstation.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outstation.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outstation.manager}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outstation.deputyManager}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outstation.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={outstation.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={outstation}
                      itemType="Outstation"
                      onView={() => handleViewOutstation(outstation)}
                      onEdit={() => handleEditOutstationClick(outstation)}
                      onDelete={() => handleDeleteOutstation(outstation.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Outstation Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddOutstation}
        title="Add New Outstation"
        mode="add"
        itemType="Outstation"
        fields={formFields}
      />

      {/* Edit Outstation Modal */}
      {currentOutstation && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditOutstation}
          title="Edit Outstation"
          mode="edit"
          itemType="Outstation"
          fields={formFields}
          initialData={currentOutstation}
        />
      )}

      {/* View Outstation Modal */}
      {currentOutstation && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Outstation Details"
          details={[
            { label: "Outstation ID", value: currentOutstation.id },
            { label: "Name", value: currentOutstation.name },
            { label: "Location", value: currentOutstation.location },
            { label: "Field Officer", value: currentOutstation.manager },
            { label: "Deputy Field Officer", value: currentOutstation.deputyManager },
            { label: "Project", value: currentOutstation.capacity },
            { label: "Status", value: <StatusBadge status={currentOutstation.status} /> },
          ]}
        />
      )}
    </div>
  )
}
