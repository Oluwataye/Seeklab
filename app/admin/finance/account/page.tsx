"use client"

import { useState } from "react"
import { ActivityIcon as AccountIcon, Plus, Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/lib/hooks/use-toast"

export default function AccountPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState([
    {
      id: "ACC-1001",
      name: "Main Operating Account",
      type: "Operating",
      balance: "NGN 15,250,000.00",
      currency: "NGN",
      bankName: "First Bank Nigeria",
      accountNumber: "3021456789",
      description: "Primary account for day-to-day operations",
      status: "Active",
    },
    {
      id: "ACC-1002",
      name: "Payroll Account",
      type: "Payroll",
      balance: "NGN 3,500,000.00",
      currency: "NGN",
      bankName: "Zenith Bank",
      accountNumber: "2056789123",
      description: "Account for employee salary payments",
      status: "Active",
    },
    {
      id: "ACC-1003",
      name: "Tax Reserve",
      type: "Tax",
      balance: "NGN 2,750,000.00",
      currency: "NGN",
      bankName: "GTBank",
      accountNumber: "0123456789",
      description: "Reserved funds for tax payments",
      status: "Active",
    },
    {
      id: "ACC-1004",
      name: "Capital Expenditure",
      type: "Capital",
      balance: "NGN 8,000,000.00",
      currency: "NGN",
      bankName: "Access Bank",
      accountNumber: "1234567890",
      description: "Account for major purchases and investments",
      status: "Active",
    },
    {
      id: "ACC-1005",
      name: "Petty Cash",
      type: "Cash",
      balance: "NGN 150,000.00",
      currency: "NGN",
      bankName: "N/A",
      accountNumber: "N/A",
      description: "Cash on hand for minor expenses",
      status: "Active",
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<any>(null)

  const handleAdd = (data: any) => {
    const newId = `ACC-${1000 + accounts.length + 1}`
    const newAccount = {
      id: newId,
      ...data,
    }
    setAccounts([...accounts, newAccount])
    setIsAddModalOpen(false)
    toast({
      title: "Success",
      description: "Account added successfully",
    })
  }

  const handleEdit = (data: any) => {
    setAccounts(accounts.map((account) => (account.id === currentAccount.id ? { ...account, ...data } : account)))
    setIsEditModalOpen(false)
    toast({
      title: "Success",
      description: "Account updated successfully",
    })
  }

  const handleDelete = () => {
    setAccounts(accounts.filter((account) => account.id !== currentAccount.id))
    setIsDeleteModalOpen(false)
    toast({
      title: "Success",
      description: "Account deleted successfully",
    })
  }

  const addFields = [
    { name: "name", label: "Account Name", type: "text", required: true },
    {
      name: "type",
      label: "Account Type",
      type: "select",
      options: [
        { label: "Operating", value: "Operating" },
        { label: "Payroll", value: "Payroll" },
        { label: "Tax", value: "Tax" },
        { label: "Capital", value: "Capital" },
        { label: "Cash", value: "Cash" },
        { label: "Savings", value: "Savings" },
      ],
      required: true,
    },
    { name: "balance", label: "Balance", type: "text", required: true },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      options: [
        { label: "NGN", value: "NGN" },
        { label: "USD", value: "USD" },
        { label: "EUR", value: "EUR" },
        { label: "GBP", value: "GBP" },
      ],
      required: true,
    },
    { name: "bankName", label: "Bank Name", type: "text", required: true },
    { name: "accountNumber", label: "Account Number", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: false },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "Frozen", value: "Frozen" },
      ],
      required: true,
    },
  ]

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <AccountIcon className="h-5 w-5 mr-2" />
          Financial Account Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Account
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
                  Account ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Account Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Account Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Balance
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Currency
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
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{account.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.balance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={account.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 mr-1"
                      onClick={() => {
                        setCurrentAccount(account)
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
                        setCurrentAccount(account)
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
                        setCurrentAccount(account)
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

      {/* Add Account Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Financial Account"
        fields={addFields}
        onSubmit={handleAdd}
        submitLabel="Add Account"
      />

      {/* Edit Account Modal */}
      {currentAccount && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Financial Account"
          fields={addFields}
          initialValues={currentAccount}
          onSubmit={handleEdit}
          submitLabel="Update Account"
        />
      )}

      {/* View Account Modal */}
      {currentAccount && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Financial Account Details"
          details={[
            { label: "Account ID", value: currentAccount.id },
            { label: "Account Name", value: currentAccount.name },
            { label: "Account Type", value: currentAccount.type },
            { label: "Balance", value: currentAccount.balance },
            { label: "Currency", value: currentAccount.currency },
            { label: "Bank Name", value: currentAccount.bankName },
            { label: "Account Number", value: currentAccount.accountNumber },
            { label: "Description", value: currentAccount.description },
            { label: "Status", value: currentAccount.status },
          ]}
        />
      )}

      {/* Delete Confirmation Modal */}
      {currentAccount && (
        <CrudModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Financial Account"
          onSubmit={handleDelete}
          submitLabel="Delete Account"
          submitVariant="destructive"
          fields={[]}
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete account <span className="font-semibold">{currentAccount.name}</span>? This
            action cannot be undone.
          </p>
        </CrudModal>
      )}
    </div>
  )
}
