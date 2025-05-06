"use client"

import { useState } from "react"
import { ArrowRightLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"
import { ViewDetails } from "@/components/view-details"
import { useToast } from "@/lib/hooks/use-toast"

type Transfer = {
  id: string
  fromAccount: string
  toAccount: string
  amount: string
  date: string
  status: "Completed" | "Pending"
  description?: string
}

export default function TransferPage() {
  const { toast } = useToast()
  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: "TRF-10001",
      fromAccount: "Main Operating Account",
      toAccount: "Payroll Account",
      amount: "NGN 3,500,000.00",
      date: "25/03/2025",
      status: "Completed",
      description: "Monthly payroll transfer",
    },
    {
      id: "TRF-10002",
      fromAccount: "Payroll Account",
      toAccount: "Tax Reserve",
      amount: "NGN 750,000.00",
      date: "10/03/2025",
      status: "Completed",
      description: "Tax payment reserve",
    },
    {
      id: "TRF-10003",
      fromAccount: "Main Operating Account",
      toAccount: "Capital Expenditure",
      amount: "NGN 2,000,000.00",
      date: "15/03/2025",
      status: "Completed",
      description: "Equipment purchase fund",
    },
    {
      id: "TRF-10004",
      fromAccount: "Capital Expenditure",
      toAccount: "Petty Cash",
      amount: "NGN 100,000.00",
      date: "20/03/2025",
      status: "Completed",
      description: "Office supplies fund",
    },
    {
      id: "TRF-10005",
      fromAccount: "Main Operating Account",
      toAccount: "Tax Reserve",
      amount: "NGN 1,250,000.00",
      date: "01/04/2025",
      status: "Pending",
      description: "Quarterly tax provision",
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentTransfer, setCurrentTransfer] = useState<Transfer | null>(null)

  // List of accounts for dropdown selection
  const accountOptions = [
    { value: "Main Operating Account", label: "Main Operating Account" },
    { value: "Payroll Account", label: "Payroll Account" },
    { value: "Tax Reserve", label: "Tax Reserve" },
    { value: "Capital Expenditure", label: "Capital Expenditure" },
    { value: "Petty Cash", label: "Petty Cash" },
    { value: "Revenue Account", label: "Revenue Account" },
  ]

  const handleAdd = (formData: any) => {
    const newId = `TRF-${10000 + transfers.length + 1}`
    const newTransfer: Transfer = {
      id: newId,
      fromAccount: formData.fromAccount,
      toAccount: formData.toAccount,
      amount: `NGN ${formData.amount}`,
      date: formData.date,
      status: formData.status,
      description: formData.description,
    }

    setTransfers([...transfers, newTransfer])
    setIsAddModalOpen(false)
    toast({
      title: "Transfer Created",
      description: `Transfer from ${formData.fromAccount} to ${formData.toAccount} has been created successfully.`,
    })
  }

  const handleEdit = (formData: any) => {
    if (!currentTransfer) return

    const updatedTransfers = transfers.map((transfer) =>
      transfer.id === currentTransfer.id
        ? {
            ...transfer,
            fromAccount: formData.fromAccount,
            toAccount: formData.toAccount,
            amount: `NGN ${formData.amount}`,
            date: formData.date,
            status: formData.status,
            description: formData.description,
          }
        : transfer,
    )

    setTransfers(updatedTransfers)
    setIsEditModalOpen(false)
    toast({
      title: "Transfer Updated",
      description: `Transfer from ${formData.fromAccount} to ${formData.toAccount} has been updated successfully.`,
    })
  }

  const handleDelete = (transfer: Transfer) => {
    const updatedTransfers = transfers.filter((t) => t.id !== transfer.id)
    setTransfers(updatedTransfers)
    toast({
      title: "Transfer Deleted",
      description: `Transfer ${transfer.id} has been deleted successfully.`,
    })
  }

  const handleView = (transfer: Transfer) => {
    setCurrentTransfer(transfer)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (transfer: Transfer) => {
    setCurrentTransfer(transfer)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <ArrowRightLeft className="h-5 w-5 mr-2" />
          Fund Transfer Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Transfer
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
                  Transfer ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  From Account
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  To Account
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
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transfer.fromAccount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.toAccount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={transfer.status}
                      colorMap={{
                        Completed: "green",
                        Pending: "yellow",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      onEdit={() => handleEditClick(transfer)}
                      onView={() => handleView(transfer)}
                      onDelete={() => handleDelete(transfer)}
                      item={transfer}
                      itemType="transfer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transfer Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        title="New Fund Transfer"
        fields={[
          {
            name: "fromAccount",
            label: "From Account",
            type: "select",
            required: true,
            options: accountOptions,
          },
          {
            name: "toAccount",
            label: "To Account",
            type: "select",
            required: true,
            options: accountOptions,
          },
          { name: "amount", label: "Amount", type: "text", required: true },
          { name: "date", label: "Transfer Date", type: "text", required: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
              { value: "Completed", label: "Completed" },
              { value: "Pending", label: "Pending" },
            ],
          },
          { name: "description", label: "Description", type: "textarea", required: false },
        ]}
      />

      {/* Edit Transfer Modal */}
      {currentTransfer && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEdit}
          title="Edit Fund Transfer"
          initialValues={{
            fromAccount: currentTransfer.fromAccount,
            toAccount: currentTransfer.toAccount,
            amount: currentTransfer.amount.replace("NGN ", ""),
            date: currentTransfer.date,
            status: currentTransfer.status,
            description: currentTransfer.description || "",
          }}
          fields={[
            {
              name: "fromAccount",
              label: "From Account",
              type: "select",
              required: true,
              options: accountOptions,
            },
            {
              name: "toAccount",
              label: "To Account",
              type: "select",
              required: true,
              options: accountOptions,
            },
            { name: "amount", label: "Amount", type: "text", required: true },
            { name: "date", label: "Transfer Date", type: "text", required: true },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: [
                { value: "Completed", label: "Completed" },
                { value: "Pending", label: "Pending" },
              ],
            },
            { name: "description", label: "Description", type: "textarea", required: false },
          ]}
        />
      )}

      {/* View Transfer Modal */}
      {currentTransfer && (
        <CrudModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Fund Transfer Details"
          viewOnly
        >
          <ViewDetails
            details={[
              { label: "Transfer ID", value: currentTransfer.id },
              { label: "From Account", value: currentTransfer.fromAccount },
              { label: "To Account", value: currentTransfer.toAccount },
              { label: "Amount", value: currentTransfer.amount },
              { label: "Transfer Date", value: currentTransfer.date },
              {
                label: "Status",
                value: (
                  <StatusBadge
                    status={currentTransfer.status}
                    colorMap={{
                      Completed: "green",
                      Pending: "yellow",
                    }}
                  />
                ),
              },
              { label: "Description", value: currentTransfer.description || "N/A" },
            ]}
          />
        </CrudModal>
      )}
    </div>
  )
}
