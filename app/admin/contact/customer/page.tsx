"use client"

import { useState } from "react"
import { UsersIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"
import { ViewDetails } from "@/components/view-details"
import { useToast } from "@/lib/hooks/use-toast"

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  type: string
  status: "Active" | "Inactive"
}

export default function CustomerPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "CUST-10001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+234 901 234 5678",
      type: "Individual",
      status: "Active",
    },
    {
      id: "CUST-10002",
      name: "ABC Corporation",
      email: "info@abccorp.com",
      phone: "+234 902 345 6789",
      type: "Corporate",
      status: "Active",
    },
    {
      id: "CUST-10003",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+234 903 456 7890",
      type: "Individual",
      status: "Inactive",
    },
    {
      id: "CUST-10004",
      name: "XYZ Enterprises",
      email: "contact@xyzent.com",
      phone: "+234 904 567 8901",
      type: "Corporate",
      status: "Active",
    },
    {
      id: "CUST-10005",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      phone: "+234 905 678 9012",
      type: "Individual",
      status: "Active",
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)

  const handleAdd = (formData: any) => {
    const newId = `CUST-${10000 + customers.length + 1}`
    const newCustomer: Customer = {
      id: newId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: formData.type,
      status: formData.status,
    }

    setCustomers([...customers, newCustomer])
    setIsAddModalOpen(false)
    toast({
      title: "Customer Added",
      description: `${formData.name} has been added successfully.`,
    })
  }

  const handleEdit = (formData: any) => {
    if (!currentCustomer) return

    const updatedCustomers = customers.map((customer) =>
      customer.id === currentCustomer.id ? { ...customer, ...formData } : customer,
    )

    setCustomers(updatedCustomers)
    setIsEditModalOpen(false)
    toast({
      title: "Customer Updated",
      description: `${formData.name} has been updated successfully.`,
    })
  }

  const handleDelete = (customer: Customer) => {
    const updatedCustomers = customers.filter((c) => c.id !== customer.id)
    setCustomers(updatedCustomers)
    toast({
      title: "Customer Deleted",
      description: `${customer.name} has been deleted successfully.`,
    })
  }

  const handleView = (customer: Customer) => {
    setCurrentCustomer(customer)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (customer: Customer) => {
    setCurrentCustomer(customer)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <UsersIcon className="h-5 w-5 mr-2" />
          Customer Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Customer
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
                  Customer ID
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
                  Email
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
                  Type
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
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      onEdit={() => handleEditClick(customer)}
                      onView={() => handleView(customer)}
                      onDelete={() => handleDelete(customer)}
                      item={customer}
                      itemType="customer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        title="Add Customer"
        fields={[
          { name: "name", label: "Customer Name", type: "text", required: true },
          { name: "email", label: "Email Address", type: "email", required: true },
          { name: "phone", label: "Phone Number", type: "text", required: true },
          {
            name: "type",
            label: "Customer Type",
            type: "select",
            required: true,
            options: [
              { value: "Individual", label: "Individual" },
              { value: "Corporate", label: "Corporate" },
            ],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ],
          },
        ]}
      />

      {/* Edit Customer Modal */}
      {currentCustomer && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEdit}
          title="Edit Customer"
          initialValues={{
            name: currentCustomer.name,
            email: currentCustomer.email,
            phone: currentCustomer.phone,
            type: currentCustomer.type,
            status: currentCustomer.status,
          }}
          fields={[
            { name: "name", label: "Customer Name", type: "text", required: true },
            { name: "email", label: "Email Address", type: "email", required: true },
            { name: "phone", label: "Phone Number", type: "text", required: true },
            {
              name: "type",
              label: "Customer Type",
              type: "select",
              required: true,
              options: [
                { value: "Individual", label: "Individual" },
                { value: "Corporate", label: "Corporate" },
              ],
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ],
            },
          ]}
        />
      )}

      {/* View Customer Modal */}
      {currentCustomer && (
        <CrudModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Customer Details" viewOnly>
          <ViewDetails
            details={[
              { label: "Customer ID", value: currentCustomer.id },
              { label: "Customer Name", value: currentCustomer.name },
              { label: "Email Address", value: currentCustomer.email },
              { label: "Phone Number", value: currentCustomer.phone },
              { label: "Customer Type", value: currentCustomer.type },
              {
                label: "Status",
                value: <StatusBadge status={currentCustomer.status} />,
              },
            ]}
          />
        </CrudModal>
      )}
    </div>
  )
}
