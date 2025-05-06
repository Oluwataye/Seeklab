"use client"

import { useState } from "react"
import { Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"
import { ViewDetails } from "@/components/view-details"
import { useToast } from "@/lib/hooks/use-toast"

type CompanyLoan = {
  id: string
  lender: string
  amount: string
  interestRate: string
  term: string
  status: "Active" | "Completed" | "Pending"
}

export default function CompanyLoanPage() {
  const { toast } = useToast()
  const [loans, setLoans] = useState<CompanyLoan[]>([
    {
      id: "CL-1001",
      lender: "First Bank Nigeria",
      amount: "NGN 25,000,000.00",
      interestRate: "12%",
      term: "5 years",
      status: "Active",
    },
    {
      id: "CL-1002",
      lender: "Zenith Bank",
      amount: "NGN 15,000,000.00",
      interestRate: "10.5%",
      term: "3 years",
      status: "Active",
    },
    {
      id: "CL-1003",
      lender: "Access Bank",
      amount: "NGN 10,000,000.00",
      interestRate: "11%",
      term: "2 years",
      status: "Active",
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentLoan, setCurrentLoan] = useState<CompanyLoan | null>(null)

  const handleAdd = (formData: any) => {
    const newId = `CL-${1000 + loans.length + 1}`
    const newLoan: CompanyLoan = {
      id: newId,
      lender: formData.lender,
      amount: `NGN ${formData.amount}`,
      interestRate: `${formData.interestRate}%`,
      term: formData.term,
      status: formData.status,
    }

    setLoans([...loans, newLoan])
    setIsAddModalOpen(false)
    toast({
      title: "Company Loan Added",
      description: `Loan from ${formData.lender} has been added successfully.`,
    })
  }

  const handleEdit = (formData: any) => {
    if (!currentLoan) return

    const updatedLoans = loans.map((loan) =>
      loan.id === currentLoan.id
        ? {
            ...loan,
            lender: formData.lender,
            amount: `NGN ${formData.amount}`,
            interestRate: `${formData.interestRate}%`,
            term: formData.term,
            status: formData.status,
          }
        : loan,
    )

    setLoans(updatedLoans)
    setIsEditModalOpen(false)
    toast({
      title: "Company Loan Updated",
      description: `Loan from ${formData.lender} has been updated successfully.`,
    })
  }

  const handleDelete = (loan: CompanyLoan) => {
    const updatedLoans = loans.filter((l) => l.id !== loan.id)
    setLoans(updatedLoans)
    toast({
      title: "Company Loan Deleted",
      description: `Loan from ${loan.lender} has been deleted successfully.`,
    })
  }

  const handleView = (loan: CompanyLoan) => {
    setCurrentLoan(loan)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (loan: CompanyLoan) => {
    setCurrentLoan(loan)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Company Loan Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Company Loan
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
                  Lender
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
                  Term
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
                    <div className="text-sm font-medium text-gray-900">{loan.lender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.interestRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.term}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={loan.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      onEdit={() => handleEditClick(loan)}
                      onView={() => handleView(loan)}
                      onDelete={() => handleDelete(loan)}
                      item={loan}
                      itemType="company loan"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Company Loan Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        title="Add Company Loan"
        fields={[
          { name: "lender", label: "Lender Name", type: "text", required: true },
          { name: "amount", label: "Loan Amount", type: "text", required: true },
          { name: "interestRate", label: "Interest Rate (%)", type: "text", required: true },
          { name: "term", label: "Loan Term", type: "text", required: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
              { value: "Active", label: "Active" },
              { value: "Completed", label: "Completed" },
              { value: "Pending", label: "Pending" },
            ],
          },
        ]}
      />

      {/* Edit Company Loan Modal */}
      {currentLoan && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEdit}
          title="Edit Company Loan"
          initialValues={{
            lender: currentLoan.lender,
            amount: currentLoan.amount.replace("NGN ", ""),
            interestRate: currentLoan.interestRate.replace("%", ""),
            term: currentLoan.term,
            status: currentLoan.status,
          }}
          fields={[
            { name: "lender", label: "Lender Name", type: "text", required: true },
            { name: "amount", label: "Loan Amount", type: "text", required: true },
            { name: "interestRate", label: "Interest Rate (%)", type: "text", required: true },
            { name: "term", label: "Loan Term", type: "text", required: true },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: [
                { value: "Active", label: "Active" },
                { value: "Completed", label: "Completed" },
                { value: "Pending", label: "Pending" },
              ],
            },
          ]}
        />
      )}

      {/* View Company Loan Modal */}
      {currentLoan && (
        <CrudModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Company Loan Details"
          viewOnly
        >
          <ViewDetails
            details={[
              { label: "Loan ID", value: currentLoan.id },
              { label: "Lender", value: currentLoan.lender },
              { label: "Loan Amount", value: currentLoan.amount },
              { label: "Interest Rate", value: currentLoan.interestRate },
              { label: "Loan Term", value: currentLoan.term },
              {
                label: "Status",
                value: <StatusBadge status={currentLoan.status} />,
              },
            ]}
          />
        </CrudModal>
      )}
    </div>
  )
}
