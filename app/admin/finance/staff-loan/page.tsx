"use client"

import { useState } from "react"
import { Wallet, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"
import { ViewDetails } from "@/components/view-details"
import { useToast } from "@/lib/hooks/use-toast"

type StaffLoan = {
  id: string
  employee: string
  amount: string
  interestRate: string
  issueDate: string
  status: "Active" | "Pending Approval"
}

export default function StaffLoanPage() {
  const { toast } = useToast()
  const [loans, setLoans] = useState<StaffLoan[]>([
    {
      id: "SL-1001",
      employee: "John Doe",
      amount: "NGN 500,000.00",
      interestRate: "5%",
      issueDate: "15/01/2025",
      status: "Active",
    },
    {
      id: "SL-1002",
      employee: "Jane Smith",
      amount: "NGN 350,000.00",
      interestRate: "5%",
      issueDate: "01/02/2025",
      status: "Pending Approval",
    },
    {
      id: "SL-1003",
      employee: "Robert Johnson",
      amount: "NGN 750,000.00",
      interestRate: "5%",
      issueDate: "10/03/2025",
      status: "Active",
    },
    {
      id: "SL-1004",
      employee: "Emily Davis",
      amount: "NGN 250,000.00",
      interestRate: "5%",
      issueDate: "05/01/2025",
      status: "Active",
    },
    {
      id: "SL-1005",
      employee: "Michael Wilson",
      amount: "NGN 600,000.00",
      interestRate: "5%",
      issueDate: "20/02/2025",
      status: "Active",
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentLoan, setCurrentLoan] = useState<StaffLoan | null>(null)

  const handleAdd = (formData: any) => {
    const newId = `SL-${1000 + loans.length + 1}`
    const newLoan: StaffLoan = {
      id: newId,
      employee: formData.employee,
      amount: `NGN ${formData.amount}`,
      interestRate: `${formData.interestRate}%`,
      issueDate: formData.issueDate,
      status: formData.status,
    }

    setLoans([...loans, newLoan])
    setIsAddModalOpen(false)
    toast({
      title: "Staff Loan Added",
      description: `Loan for ${formData.employee} has been added successfully.`,
    })
  }

  const handleEdit = (formData: any) => {
    if (!currentLoan) return

    const updatedLoans = loans.map((loan) =>
      loan.id === currentLoan.id
        ? {
            ...loan,
            employee: formData.employee,
            amount: `NGN ${formData.amount}`,
            interestRate: `${formData.interestRate}%`,
            issueDate: formData.issueDate,
            status: formData.status,
          }
        : loan,
    )

    setLoans(updatedLoans)
    setIsEditModalOpen(false)
    toast({
      title: "Staff Loan Updated",
      description: `Loan for ${formData.employee} has been updated successfully.`,
    })
  }

  const handleDelete = (loan: StaffLoan) => {
    const updatedLoans = loans.filter((l) => l.id !== loan.id)
    setLoans(updatedLoans)
    toast({
      title: "Staff Loan Deleted",
      description: `Loan for ${loan.employee} has been deleted successfully.`,
    })
  }

  const handleView = (loan: StaffLoan) => {
    setCurrentLoan(loan)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (loan: StaffLoan) => {
    setCurrentLoan(loan)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Wallet className="h-5 w-5 mr-2" />
          Staff Loan Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Staff Loan
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
                  Loan ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Employee
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
                  Interest Rate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Issue Date
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
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{loan.employee}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.interestRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.issueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={loan.status}
                      colorMap={{
                        Active: "green",
                        "Pending Approval": "yellow",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      onEdit={() => handleEditClick(loan)}
                      onView={() => handleView(loan)}
                      onDelete={() => handleDelete(loan)}
                      item={loan}
                      itemType="staff loan"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Loan Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        title="Add Staff Loan"
        fields={[
          { name: "employee", label: "Employee Name", type: "text", required: true },
          { name: "amount", label: "Loan Amount", type: "text", required: true },
          { name: "interestRate", label: "Interest Rate (%)", type: "text", required: false },
          { name: "issueDate", label: "Issue Date", type: "text", required: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
              { value: "Active", label: "Active" },
              { value: "Pending Approval", label: "Pending Approval" },
            ],
          },
        ]}
      />

      {/* Edit Staff Loan Modal */}
      {currentLoan && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEdit}
          title="Edit Staff Loan"
          initialValues={{
            employee: currentLoan.employee,
            amount: currentLoan.amount.replace("NGN ", ""),
            interestRate: currentLoan.interestRate.replace("%", ""),
            issueDate: currentLoan.issueDate,
            status: currentLoan.status,
          }}
          fields={[
            { name: "employee", label: "Employee Name", type: "text", required: true },
            { name: "amount", label: "Loan Amount", type: "text", required: true },
            { name: "interestRate", label: "Interest Rate (%)", type: "text", required: false },
            { name: "issueDate", label: "Issue Date", type: "text", required: true },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: [
                { value: "Active", label: "Active" },
                { value: "Pending Approval", label: "Pending Approval" },
              ],
            },
          ]}
        />
      )}

      {/* View Staff Loan Modal */}
      {currentLoan && (
        <CrudModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Staff Loan Details"
          viewOnly
        >
          <ViewDetails
            details={[
              { label: "Loan ID", value: currentLoan.id },
              { label: "Employee", value: currentLoan.employee },
              { label: "Loan Amount", value: currentLoan.amount },
              { label: "Interest Rate", value: currentLoan.interestRate },
              { label: "Issue Date", value: currentLoan.issueDate },
              {
                label: "Status",
                value: (
                  <StatusBadge
                    status={currentLoan.status}
                    colorMap={{
                      Active: "green",
                      "Pending Approval": "yellow",
                    }}
                  />
                ),
              },
            ]}
          />
        </CrudModal>
      )}
    </div>
  )
}
