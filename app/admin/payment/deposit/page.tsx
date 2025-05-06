"use client"

import { useState } from "react"
import { PiggyBank, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"

// Sample data for deposits
const initialDeposits = [
  {
    id: "DEP-10001",
    account: "Main Operating Account",
    amount: "NGN 2,500,000.00",
    date: "15/03/2025",
    depositedBy: "John Smith",
    status: "completed",
  },
  {
    id: "DEP-10002",
    account: "Payroll Account",
    amount: "NGN 1,800,000.00",
    date: "18/03/2025",
    depositedBy: "Sarah Johnson",
    status: "completed",
  },
  {
    id: "DEP-10003",
    account: "Tax Reserve",
    amount: "NGN 750,000.00",
    date: "20/03/2025",
    depositedBy: "Michael Brown",
    status: "completed",
  },
  {
    id: "DEP-10004",
    account: "Main Operating Account",
    amount: "NGN 3,200,000.00",
    date: "25/03/2025",
    depositedBy: "Emily Davis",
    status: "completed",
  },
  {
    id: "DEP-10005",
    account: "Capital Expenditure",
    amount: "NGN 1,500,000.00",
    date: "28/03/2025",
    depositedBy: "Robert Wilson",
    status: "pending",
  },
]

// Sample accounts for dropdown
const accounts = [
  { value: "Main Operating Account", label: "Main Operating Account" },
  { value: "Payroll Account", label: "Payroll Account" },
  { value: "Tax Reserve", label: "Tax Reserve" },
  { value: "Capital Expenditure", label: "Capital Expenditure" },
  { value: "Petty Cash", label: "Petty Cash" },
]

export default function DepositPage() {
  const [deposits, setDeposits] = useState(initialDeposits)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentDeposit, setCurrentDeposit] = useState<any>(null)

  // Filter deposits based on search term
  const filteredDeposits = deposits.filter(
    (deposit) =>
      deposit.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.depositedBy.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle add deposit
  const handleAddDeposit = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    // Format amount with NGN prefix if not already included
    if (!data.amount.startsWith("NGN")) {
      data.amount = `NGN ${data.amount}`
    }

    const newDeposit = {
      id: `DEP-${10006 + deposits.length}`,
      ...data,
    }

    setDeposits([...deposits, newDeposit])
    setIsAddModalOpen(false)
  }

  // Handle edit deposit
  const handleEditDeposit = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    // Format amount with NGN prefix if not already included
    if (data.amount && !data.amount.startsWith("NGN")) {
      data.amount = `NGN ${data.amount}`
    }

    setDeposits(deposits.map((deposit) => (deposit.id === currentDeposit.id ? { ...deposit, ...data } : deposit)))

    setIsEditModalOpen(false)
  }

  // Handle delete deposit
  const handleDeleteDeposit = (id: string) => {
    setDeposits(deposits.filter((deposit) => deposit.id !== id))
  }

  // Handle view deposit
  const handleViewDeposit = (deposit: any) => {
    setCurrentDeposit(deposit)
    setIsViewModalOpen(true)
  }

  // Handle edit deposit
  const handleEditDepositClick = (deposit: any) => {
    setCurrentDeposit(deposit)
    setIsEditModalOpen(true)
  }

  // Form fields for add/edit modal
  const formFields = [
    {
      name: "account",
      label: "Account",
      type: "select",
      required: true,
      options: accounts,
    },
    { name: "amount", label: "Amount", type: "text", required: true },
    { name: "date", label: "Date", type: "text", required: true },
    { name: "depositedBy", label: "Deposited By", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
      ],
    },
  ]

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <PiggyBank className="h-5 w-5 mr-2" />
          Deposit Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Deposit
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search deposits..."
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
                  Deposit ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Account
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
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
                  Deposited By
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
              {filteredDeposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{deposit.account}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.depositedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={deposit.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={deposit}
                      itemType="Deposit"
                      onView={() => handleViewDeposit(deposit)}
                      onEdit={() => handleEditDepositClick(deposit)}
                      onDelete={() => handleDeleteDeposit(deposit.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Deposit Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDeposit}
        title="Add New Deposit"
        mode="add"
        itemType="Deposit"
        fields={formFields}
      />

      {/* Edit Deposit Modal */}
      {currentDeposit && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditDeposit}
          title="Edit Deposit"
          mode="edit"
          itemType="Deposit"
          fields={formFields}
          initialData={currentDeposit}
        />
      )}

      {/* View Deposit Modal */}
      {currentDeposit && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Deposit Details"
          details={[
            { label: "Deposit ID", value: currentDeposit.id },
            { label: "Account", value: currentDeposit.account },
            { label: "Amount", value: currentDeposit.amount },
            { label: "Date", value: currentDeposit.date },
            { label: "Deposited By", value: currentDeposit.depositedBy },
            { label: "Status", value: <StatusBadge status={currentDeposit.status} /> },
          ]}
        />
      )}
    </div>
  )
}
