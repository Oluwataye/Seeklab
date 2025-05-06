"use client"

import { useState } from "react"
import { CircleDollarSign, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"

// Sample data for miscellaneous income
const initialIncomes = [
  {
    id: "INC-10001",
    source: "Rent Income",
    amount: "NGN 500,000.00",
    date: "15/03/2025",
    account: "Main Operating Account",
    status: "completed",
  },
  {
    id: "INC-10002",
    source: "Interest Income",
    amount: "NGN 250,000.00",
    date: "18/03/2025",
    account: "Main Operating Account",
    status: "completed",
  },
  {
    id: "INC-10003",
    source: "Asset Sale",
    amount: "NGN 1,200,000.00",
    date: "20/03/2025",
    account: "Capital Expenditure",
    status: "pending",
  },
  {
    id: "INC-10004",
    source: "Consultancy Fee",
    amount: "NGN 350,000.00",
    date: "25/03/2025",
    account: "Main Operating Account",
    status: "completed",
  },
  {
    id: "INC-10005",
    source: "Royalty Income",
    amount: "NGN 180,000.00",
    date: "28/03/2025",
    account: "Main Operating Account",
    status: "completed",
  },
]

// Sample accounts for dropdown
const accounts = [
  { value: "Main Operating Account", label: "Main Operating Account" },
  { value: "Payroll Account", label: "Payroll Account" },
  { value: "Tax Reserve", label: "Tax Reserve" },
  { value: "Capital Expenditure", label: "Capital Expenditure" },
  { value: "Petty Cash" },
  { value: "Capital Expenditure", label: "Capital Expenditure" },
  { value: "Petty Cash", label: "Petty Cash" },
]

// Sample income sources for dropdown
const incomeSources = [
  { value: "Rent Income", label: "Rent Income" },
  { value: "Interest Income", label: "Interest Income" },
  { value: "Asset Sale", label: "Asset Sale" },
  { value: "Consultancy Fee", label: "Consultancy Fee" },
  { value: "Royalty Income", label: "Royalty Income" },
  { value: "Miscellaneous", label: "Miscellaneous" },
]

export default function MiscellaneousIncomePage() {
  const [incomes, setIncomes] = useState(initialIncomes)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentIncome, setCurrentIncome] = useState<any>(null)

  // Filter incomes based on search term
  const filteredIncomes = incomes.filter(
    (income) =>
      income.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.account.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle add income
  const handleAddIncome = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    // Format amount with NGN prefix if not already included
    if (!data.amount.startsWith("NGN")) {
      data.amount = `NGN ${data.amount}`
    }

    const newIncome = {
      id: `INC-${10006 + incomes.length}`,
      ...data,
    }

    setIncomes([...incomes, newIncome])
    setIsAddModalOpen(false)
  }

  // Handle edit income
  const handleEditIncome = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    // Format amount with NGN prefix if not already included
    if (data.amount && !data.amount.startsWith("NGN")) {
      data.amount = `NGN ${data.amount}`
    }

    setIncomes(incomes.map((income) => (income.id === currentIncome.id ? { ...income, ...data } : income)))

    setIsEditModalOpen(false)
  }

  // Handle delete income
  const handleDeleteIncome = (id: string) => {
    setIncomes(incomes.filter((income) => income.id !== id))
  }

  // Handle view income
  const handleViewIncome = (income: any) => {
    setCurrentIncome(income)
    setIsViewModalOpen(true)
  }

  // Handle edit income
  const handleEditIncomeClick = (income: any) => {
    setCurrentIncome(income)
    setIsEditModalOpen(true)
  }

  // Form fields for add/edit modal
  const formFields = [
    {
      name: "source",
      label: "Source",
      type: "select",
      required: true,
      options: incomeSources,
    },
    { name: "amount", label: "Amount", type: "text", required: true },
    { name: "date", label: "Date", type: "text", required: true },
    {
      name: "account",
      label: "Account",
      type: "select",
      required: true,
      options: accounts,
    },
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
          <CircleDollarSign className="h-5 w-5 mr-2" />
          Miscellaneous Income Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Income
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search incomes..."
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
                  Income ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Source
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
                  Account
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
              {filteredIncomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{income.source}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.account}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={income.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={income}
                      itemType="Income"
                      onView={() => handleViewIncome(income)}
                      onEdit={() => handleEditIncomeClick(income)}
                      onDelete={() => handleDeleteIncome(income.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Income Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddIncome}
        title="Add New Income"
        mode="add"
        itemType="Income"
        fields={formFields}
      />

      {/* Edit Income Modal */}
      {currentIncome && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditIncome}
          title="Edit Income"
          mode="edit"
          itemType="Income"
          fields={formFields}
          initialData={currentIncome}
        />
      )}

      {/* View Income Modal */}
      {currentIncome && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Income Details"
          details={[
            { label: "Income ID", value: currentIncome.id },
            { label: "Source", value: currentIncome.source },
            { label: "Amount", value: currentIncome.amount },
            { label: "Date", value: currentIncome.date },
            { label: "Account", value: currentIncome.account },
            { label: "Status", value: <StatusBadge status={currentIncome.status} /> },
          ]}
        />
      )}
    </div>
  )
}
