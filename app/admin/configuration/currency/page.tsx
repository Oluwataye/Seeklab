"use client"

import { useState } from "react"
import { Globe, Plus, Search, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import StatusBadge from "@/components/status-badge"
import { useToastContext } from "@/components/toast-provider"

// Mock data for currencies
const initialCurrencies = [
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    exchangeRate: "1.00",
    status: "Active",
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    exchangeRate: "1,500.00",
    status: "Active",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    exchangeRate: "1,650.00",
    status: "Active",
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    exchangeRate: "1,900.00",
    status: "Active",
  },
]

export default function CurrencyPage() {
  const { toast } = useToastContext()
  const [currencies, setCurrencies] = useState(initialCurrencies)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentCurrency, setCurrentCurrency] = useState<any>(null)

  // Filter currencies based on search term
  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddCurrency = (data: any) => {
    // Create new currency object
    const newCurrency = {
      code: data.code.toUpperCase(),
      name: data.name,
      symbol: data.symbol,
      exchangeRate: data.exchangeRate,
      status: data.status,
    }

    // Add to currencies array
    setCurrencies([...currencies, newCurrency])

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleEditCurrency = (data: any) => {
    // Update currency in the array
    const updatedCurrencies = currencies.map((currency) =>
      currency.code === data.code
        ? {
            ...currency,
            name: data.name,
            symbol: data.symbol,
            exchangeRate: data.exchangeRate,
            status: data.status,
          }
        : currency,
    )

    setCurrencies(updatedCurrencies)

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleDeleteCurrency = (code: string) => {
    // Remove currency from the array
    setCurrencies(currencies.filter((currency) => currency.code !== code))

    // Show success toast
    toast.success("Currency Deleted", "Currency has been deleted successfully")
  }

  const handleView = (currency: any) => {
    setCurrentCurrency(currency)
    setIsViewModalOpen(true)
  }

  const handleEdit = (currency: any) => {
    setCurrentCurrency(currency)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Currency Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Currency
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search currencies..."
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
                  Currency Code
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Currency Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Symbol
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Exchange Rate (to NGN)
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
              {filteredCurrencies.map((currency) => (
                <tr key={currency.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currency.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{currency.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currency.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currency.exchangeRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={currency.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(currency)} className="text-red-600 hover:text-red-900 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleView(currency)} className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Currency Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Currency"
        mode="add"
        itemType="Currency"
        onSave={handleAddCurrency}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Currency Code</Label>
            <Input id="code" name="code" placeholder="e.g. USD" maxLength={3} required />
            <p className="text-xs text-gray-500 mt-1">3-letter ISO currency code (e.g., USD, EUR, GBP)</p>
          </div>
          <div>
            <Label htmlFor="name">Currency Name</Label>
            <Input id="name" name="name" placeholder="e.g. US Dollar" required />
          </div>
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <DollarSign className="h-4 w-4" />
              </span>
              <Input id="symbol" name="symbol" placeholder="e.g. $" className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="exchangeRate">Exchange Rate (to NGN)</Label>
            <Input id="exchangeRate" name="exchangeRate" placeholder="e.g. 1,500.00" required />
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

      {/* Edit Currency Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Currency"
        mode="edit"
        itemType="Currency"
        initialData={currentCurrency}
        onSave={handleEditCurrency}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Currency Code</Label>
            <Input id="code" name="code" defaultValue={currentCurrency?.code} disabled />
          </div>
          <div>
            <Label htmlFor="name">Currency Name</Label>
            <Input id="name" name="name" defaultValue={currentCurrency?.name} required />
          </div>
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <DollarSign className="h-4 w-4" />
              </span>
              <Input id="symbol" name="symbol" defaultValue={currentCurrency?.symbol} className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="exchangeRate">Exchange Rate (to NGN)</Label>
            <Input id="exchangeRate" name="exchangeRate" defaultValue={currentCurrency?.exchangeRate} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={currentCurrency?.status}>
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

      {/* View Currency Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Currency Details"
        mode="view"
        itemType="Currency"
      >
        {currentCurrency && (
          <ViewDetails
            details={[
              { label: "Currency Code", value: currentCurrency.code },
              { label: "Currency Name", value: currentCurrency.name },
              { label: "Symbol", value: currentCurrency.symbol },
              { label: "Exchange Rate (to NGN)", value: currentCurrency.exchangeRate },
              { label: "Status", value: <StatusBadge status={currentCurrency.status} /> },
            ]}
          />
        )}
      </CrudModal>
    </div>
  )
}
