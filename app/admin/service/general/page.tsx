"use client"

import { useState } from "react"
import { Wrench, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"

// Sample data
const initialServices = [
  {
    id: "SRV-10001",
    serviceType: "Equipment Repair",
    description: "Printer not working properly",
    requestedBy: "John Smith",
    dateRequested: "15/03/2025",
    assignedTo: "Tech Support Team",
    status: "Completed",
    priority: "Medium",
    location: "Main Office",
    completionDate: "18/03/2025",
    notes: "Replaced toner cartridge and cleaned printer heads.",
  },
  {
    id: "SRV-10002",
    serviceType: "IT Support",
    description: "Computer freezing frequently",
    requestedBy: "Sarah Johnson",
    dateRequested: "18/03/2025",
    assignedTo: "IT Department",
    status: "In Progress",
    priority: "High",
    location: "Finance Department",
    completionDate: "",
    notes: "Running diagnostics and checking for malware.",
  },
  {
    id: "SRV-10003",
    serviceType: "Facility Maintenance",
    description: "AC not cooling properly",
    requestedBy: "Michael Brown",
    dateRequested: "20/03/2025",
    assignedTo: "Maintenance Crew",
    status: "Pending",
    priority: "High",
    location: "Conference Room",
    completionDate: "",
    notes: "Scheduled for inspection on 22/03/2025.",
  },
  {
    id: "SRV-10004",
    serviceType: "Software Installation",
    description: "Install accounting software",
    requestedBy: "Emily Davis",
    dateRequested: "25/03/2025",
    assignedTo: "IT Department",
    status: "Scheduled",
    priority: "Low",
    location: "Accounting Department",
    completionDate: "",
    notes: "Scheduled for installation on 27/03/2025.",
  },
  {
    id: "SRV-10005",
    serviceType: "Network Setup",
    description: "Setup new office network",
    requestedBy: "Robert Wilson",
    dateRequested: "28/03/2025",
    assignedTo: "Network Team",
    status: "New",
    priority: "Medium",
    location: "New Branch Office",
    completionDate: "",
    notes: "Waiting for equipment delivery.",
  },
]

export default function GeneralServicePage() {
  const [services, setServices] = useState(initialServices)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentService, setCurrentService] = useState<any>(null)

  // Filter services based on search term
  const filteredServices = services.filter(
    (service) =>
      service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Form fields for add/edit service
  const formFields = [
    {
      name: "serviceType",
      label: "Service Type",
      type: "select",
      options: [
        { value: "Equipment Repair", label: "Equipment Repair" },
        { value: "IT Support", label: "IT Support" },
        { value: "Facility Maintenance", label: "Facility Maintenance" },
        { value: "Software Installation", label: "Software Installation" },
        { value: "Network Setup", label: "Network Setup" },
        { value: "General Maintenance", label: "General Maintenance" },
        { value: "Electrical Work", label: "Electrical Work" },
        { value: "Plumbing", label: "Plumbing" },
        { value: "Security System", label: "Security System" },
        { value: "Other", label: "Other" },
      ],
      required: true,
    },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "requestedBy", label: "Requested By", type: "text", required: true },
    { name: "dateRequested", label: "Date Requested", type: "date", required: true },
    { name: "location", label: "Location", type: "text", required: true },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" },
        { value: "Critical", label: "Critical" },
      ],
      required: true,
    },
    { name: "assignedTo", label: "Assigned To", type: "text", required: false },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "New", label: "New" },
        { value: "Pending", label: "Pending" },
        { value: "Scheduled", label: "Scheduled" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ],
      required: true,
    },
    { name: "completionDate", label: "Completion Date", type: "date", required: false },
    { name: "notes", label: "Notes", type: "textarea", required: false },
  ]

  // Handle add service
  const handleAddService = (formData: any) => {
    const newService = {
      id: `SRV-${10000 + services.length + 1}`,
      ...formData,
      dateRequested: formData.dateRequested
        ? new Date(formData.dateRequested).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB"),
      completionDate: formData.completionDate ? new Date(formData.completionDate).toLocaleDateString("en-GB") : "",
    }
    setServices([...services, newService])
    setIsAddModalOpen(false)
  }

  // Handle edit service
  const handleEditService = (formData: any) => {
    const updatedServices = services.map((service) =>
      service.id === currentService.id
        ? {
            ...service,
            ...formData,
            dateRequested: formData.dateRequested
              ? new Date(formData.dateRequested).toLocaleDateString("en-GB")
              : service.dateRequested,
            completionDate: formData.completionDate
              ? new Date(formData.completionDate).toLocaleDateString("en-GB")
              : service.completionDate,
          }
        : service,
    )
    setServices(updatedServices)
    setIsEditModalOpen(false)
  }

  // Handle delete service
  const handleDeleteService = (id: string) => {
    const updatedServices = services.filter((service) => service.id !== id)
    setServices(updatedServices)
  }

  // Handle view service
  const handleViewService = (service: any) => {
    setCurrentService(service)
    setIsViewModalOpen(true)
  }

  // Handle edit service click
  const handleEditServiceClick = (service: any) => {
    // Convert date strings to ISO format for the date inputs
    const serviceWithFormattedDates = {
      ...service,
      dateRequested: formatDateForInput(service.dateRequested),
      completionDate: service.completionDate ? formatDateForInput(service.completionDate) : "",
    }
    setCurrentService(serviceWithFormattedDates)
    setIsEditModalOpen(true)
  }

  // Helper function to format date strings for date inputs
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    const [day, month, year] = dateString.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          General Service Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Service Request
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search services..."
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
                  Service ID
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
                  Description
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
                  Date Requested
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Assigned To
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
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.serviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.requestedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.dateRequested}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.assignedTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={service.status}
                      statusMap={{
                        New: "info",
                        Pending: "warning",
                        Scheduled: "purple",
                        "In Progress": "blue",
                        Completed: "success",
                        Cancelled: "error",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={service}
                      itemType="Service"
                      onView={() => handleViewService(service)}
                      onEdit={() => handleEditServiceClick(service)}
                      onDelete={() => handleDeleteService(service.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="New Service Request"
        fields={formFields}
        onSubmit={handleAddService}
        mode="add"
        itemType="Service Request"
      />

      {/* Edit Service Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Service Request"
        fields={formFields}
        initialData={currentService}
        onSubmit={handleEditService}
        mode="edit"
        itemType="Service Request"
      />

      {/* View Service Modal */}
      {currentService && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Service Request Details: ${currentService.id}`}
          details={[
            { label: "Service ID", value: currentService.id },
            { label: "Service Type", value: currentService.serviceType },
            { label: "Description", value: currentService.description },
            { label: "Requested By", value: currentService.requestedBy },
            { label: "Date Requested", value: currentService.dateRequested },
            { label: "Location", value: currentService.location },
            { label: "Priority", value: currentService.priority },
            { label: "Assigned To", value: currentService.assignedTo || "Not assigned yet" },
            {
              label: "Status",
              value: currentService.status,
              type: "status",
              statusMap: {
                New: "info",
                Pending: "warning",
                Scheduled: "purple",
                "In Progress": "blue",
                Completed: "success",
                Cancelled: "error",
              },
            },
            { label: "Completion Date", value: currentService.completionDate || "Not completed yet" },
            { label: "Notes", value: currentService.notes || "No notes available" },
          ]}
        />
      )}
    </div>
  )
}
