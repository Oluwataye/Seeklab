"use client"

import { useState } from "react"
import { Landmark, Plus, Search, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import StatusBadge from "@/components/status-badge"
import { useToastContext } from "@/components/toast-provider"

// Mock data for banks
const initialBanks = [
  {
    id: "BNK-101",
    name: "First Bank",
    accountNumber: "1234567890",
    branch: "Lagos Main",
    status: "Active",
  },
  {
    id: "BNK-102",
    name: "Zenith Bank",
    accountNumber: "0987654321",
    branch: "Abuja Central",
    status: "Active",
  },
  {
    id: "BNK-103",
    name: "GTBank",
    accountNumber: "1122334455",
    branch: "Port Harcourt",
    status: "Active",
  },
  {
    id: "BNK-104",
    name: "Access Bank",
    accountNumber: "5566778899",
    branch: "Ikeja",
    status: "Inactive",
  },
  {
    id: "BNK-105",
    name: "UBA",
    accountNumber: "9988776655",
    branch: "Victoria Island",
    status: "Active",
  },
]

export default function BankPage() {
  const { toast } = useToastContext()
  const [banks, setBanks] = useState(initialBanks)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentBank, setCurrentBank] = useState<any>(null)

  // Filter banks based on search term
  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.accountNumber.includes(searchTerm) ||
      bank.branch.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddBank = (data: any) => {
    // Generate a new ID
    const newId = `BNK-${106 + banks.length - 5}`

    // Create new bank object
    const newBank = {
      id: newId,
      name: data.name,
      accountNumber: data.accountNumber,
      branch: data.branch,
      status: data.status,
    }

    // Add to banks array
    setBanks([...banks, newBank])

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleEditBank = (data: any) => {
    // Update bank in the array
    const updatedBanks = banks.map((bank) =>
      bank.id === data.id
        ? {
            ...bank,
            name: data.name,
            accountNumber: data.accountNumber,
            branch: data.branch,
            status: data.status,
          }
        : bank,
    )

    setBanks(updatedBanks)

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleDeleteBank = (id: string) => {
    // Remove bank from the array
    setBanks(banks.filter((bank) => bank.id !== id))

    // Show success toast
    toast.success("Bank Deleted", "Bank has been deleted successfully")
  }

  const handleView = (bank: any) => {
    setCurrentBank(bank)
    setIsViewModalOpen(true)
  }

  const handleEdit = (bank: any) => {
    setCurrentBank(bank)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Landmark className="h-5 w-5 mr-2" />
          Bank Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Bank
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search banks..."
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
                  Bank ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Bank Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Account Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Branch
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
              {filteredBanks.map((bank) => (
                <tr key={bank.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bank.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bank.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bank.accountNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bank.branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={bank.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(bank)} className="text-red-600 hover:text-red-900 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleView(bank)} className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bank Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Bank"
        mode="add"
        itemType="Bank"
        onSave={handleAddBank}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Bank Name</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Building className="h-4 w-4" />
              </span>
              <Input id="name" name="name" className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" name="accountNumber" required />
          </div>
          <div>
            <Label htmlFor="branch">Branch</Label>
            <Input id="branch" name="branch" required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="Active">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CrudModal>

      {/* Edit Bank Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Bank"
        mode="edit"
        itemType="Bank"
        initialData={currentBank}
        onSave={handleEditBank}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="id">Bank ID</Label>
            <Input id="id" name="id" defaultValue={currentBank?.id} disabled />
          </div>
          <div>
            <Label htmlFor="name">Bank Name</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Building className="h-4 w-4" />
              </span>
              <Input id="name" name="name" defaultValue={currentBank?.name} className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" name="accountNumber" defaultValue={currentBank?.accountNumber} required />
          </div>
          <div>
            <Label htmlFor="branch">Branch</Label>
            <Input id="branch" name="branch" defaultValue={currentBank?.branch} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={currentBank?.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CrudModal>

      {/* View Bank Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Bank Details"
        mode="view"
        itemType="Bank"
      >
        {currentBank && (
          <ViewDetails
            details={[
              { label: "Bank ID", value: currentBank.id },
              { label: "Bank Name", value: currentBank.name },
              { label: "Account Number", value: currentBank.accountNumber },
              { label: "Branch", value: currentBank.branch },
              { label: "Status", value: <StatusBadge status={currentBank.status} /> },
            ]}
          />
        )}
      </CrudModal>
    </div>
  )
}
