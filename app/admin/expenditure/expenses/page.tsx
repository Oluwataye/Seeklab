"use client"

import { useState } from "react"
import { Receipt, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"

// Sample data
const initialExpenses = [
  {
    id: "EXP-10001",
    category: "Office Supplies",
    description: "Stationery and printer ink",
    amount: "NGN 75,000.00",
    date: "15/03/2025",
    submittedBy: "John Smith",
    status: "Approved",
    receiptUrl: "#",
    notes: "Monthly office supplies",
  },
  {
    id: "EXP-10002",
    category: "Travel",
    description: "Business trip to Abuja",
    amount: "NGN 350,000.00",
    date: "18/03/2025",
    submittedBy: "Sarah Johnson",
    status: "Approved",
    receiptUrl: "#",
    notes: "Client meeting and presentation",
  },
  {
    id: "EXP-10003",
    category: "Utilities",
    description: "Electricity bill for March",
    amount: "NGN 120,000.00",
    date: "20/03/2025",
    submittedBy: "Michael Brown",
    status: "Pending Approval",
    receiptUrl: "#",
    notes: "Higher than usual due to increased usage",
  },
  {
    id: "EXP-10004",
    category: "Maintenance",
    description: "Office AC repair",
    amount: "NGN 45,000.00",
    date: "25/03/2025",
    submittedBy: "Emily Davis",
    status: "Approved",
    receiptUrl: "#",
    notes: "Emergency repair",
  },
  {
    id: "EXP-10005",
    category: "Marketing",
    description: "Digital advertising campaign",
    amount: "NGN 250,000.00",
    date: "28/03/2025",
    submittedBy: "Robert Wilson",
    status: "Under Review",
    receiptUrl: "#",
    notes: "Q2 marketing campaign",
  },
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<any>(null)

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Form fields for add/edit expense
  const formFields = [
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "Office Supplies", label: "Office Supplies" },
        { value: "Travel", label: "Travel" },
        { value: "Utilities", label: "Utilities" },
        { value: "Maintenance", label: "Maintenance" },
        { value: "Marketing", label: "Marketing" },
        { value: "Rent", label: "Rent" },
        { value: "Salaries", label: "Salaries" },
        { value: "Other", label: "Other" },
      ],
    },
    { name: "description", label: "Description", type: "text", required: true },
    { name: "amount", label: "Amount", type: "text", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "submittedBy", label: "Submitted By", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "Approved", label: "Approved" },
        { value: "Pending Approval", label: "Pending Approval" },
        { value: "Under Review", label: "Under Review" },
        { value: "Rejected", label: "Rejected" },
      ],
    },
    { name: "paymentMethod", label: "Payment Method", type: "text", required: false },
    { name: "receiptUrl", label: "Receipt URL", type: "text", required: false },
    { name: "notes", label: "Notes", type: "textarea", required: false },
  ]

  // Handle add expense
  const handleAddExpense = (formData: any) => {
    const newExpense = {
      id: `EXP-${10000 + expenses.length + 1}`,
      ...formData,
      createdAt: new Date().toISOString(),
    }
    setExpenses([...expenses, newExpense])
    setIsAddModalOpen(false)
  }

  // Handle edit expense
  const handleEditExpense = (formData: any) => {
    const updatedExpenses = expenses.map((expense) =>
      expense.id === currentExpense.id
        ? {
            ...expense,
            ...formData,
            // Preserve the creation timestamp if it exists
            createdAt: expense.createdAt || new Date().toISOString(),
            // Add an updated timestamp
            updatedAt: new Date().toISOString(),
          }
        : expense,
    )
    setExpenses(updatedExpenses)
    setIsEditModalOpen(false)
  }

  // Handle delete expense
  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id)
    setExpenses(updatedExpenses)
  }

  // Handle view expense
  const handleViewExpense = (expense: any) => {
    setCurrentExpense(expense)
    setIsViewModalOpen(true)
  }

  // Handle edit expense click
  const handleEditExpenseClick = (expense: any) => {
    setCurrentExpense(expense)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Receipt className="h-5 w-5 mr-2" />
          Expenses Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Expense
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search expenses..."
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
                  Expense ID
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
                  Description
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
                  Submitted By
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
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{expense.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.submittedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={expense.status}
                      statusMap={{
                        Approved: "success",
                        "Pending Approval": "warning",
                        "Under Review": "info",
                        Rejected: "error",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={expense}
                      itemType="Expense"
                      onView={() => handleViewExpense(expense)}
                      onEdit={() => handleEditExpenseClick(expense)}
                      onDelete={() => handleDeleteExpense(expense.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
        fields={formFields}
        onSubmit={handleAddExpense}
        mode="add"
        itemType="Expense"
      />

      {/* Edit Expense Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Expense"
        fields={formFields}
        initialData={currentExpense}
        onSubmit={handleEditExpense}
        mode="edit"
        itemType="Expense"
      />

      {/* View Expense Modal */}
      {currentExpense && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Expense Details: ${currentExpense.id}`}
          details={[
            { label: "Expense ID", value: currentExpense.id },
            { label: "Category", value: currentExpense.category },
            { label: "Description", value: currentExpense.description },
            { label: "Amount", value: currentExpense.amount },
            { label: "Date", value: currentExpense.date },
            { label: "Submitted By", value: currentExpense.submittedBy },
            { label: "Status", value: currentExpense.status },
            { label: "Receipt", value: currentExpense.receiptUrl ? "Available" : "Not Available" },
            { label: "Notes", value: currentExpense.notes || "N/A" },
          ]}
        />
      )}
    </div>
  )
}
