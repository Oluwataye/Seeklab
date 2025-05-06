"use client"

import { useState } from "react"
import { Store, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CrudModal from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import StatusBadge from "@/components/status-badge"
import { useToastContext } from "@/components/toast-provider"

// Mock data for stores
const mockStores = [
  {
    id: "STR-101",
    name: "Main Store",
    location: "Head Office",
    manager: "John Smith",
    staffCount: "15",
    status: "Active",
  },
  {
    id: "STR-102",
    name: "Electronics Store",
    location: "Branch 1",
    manager: "Sarah Johnson",
    staffCount: "8",
    status: "Active",
  },
  {
    id: "STR-103",
    name: "Furniture Store",
    location: "Branch 2",
    manager: "Michael Brown",
    staffCount: "10",
    status: "Under Renovation",
  },
  {
    id: "STR-104",
    name: "Appliance Store",
    location: "Warehouse",
    manager: "Emily Davis",
    staffCount: "6",
    status: "Active",
  },
]

// Mock data for locations (for dropdown)
const mockLocations = [
  { id: "LOC-101", name: "Head Office" },
  { id: "LOC-102", name: "Branch 1" },
  { id: "LOC-103", name: "Branch 2" },
  { id: "LOC-104", name: "Warehouse" },
]

// Mock data for managers (for dropdown)
const mockManagers = [
  { id: "MGR-101", name: "John Smith" },
  { id: "MGR-102", name: "Sarah Johnson" },
  { id: "MGR-103", name: "Michael Brown" },
  { id: "MGR-104", name: "Emily Davis" },
  { id: "MGR-105", name: "David Wilson" },
]

export default function StoreManagementPage() {
  const { toast } = useToastContext()
  const [stores, setStores] = useState(mockStores)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentStore, setCurrentStore] = useState<any>(null)

  const handleAddStore = (data: any) => {
    // Generate a new ID
    const newId = `STR-${105 + stores.length}`

    // Create new store object
    const newStore = {
      id: newId,
      name: data.name,
      location: data.location,
      manager: data.manager,
      staffCount: data.staffCount || "0",
      status: data.status,
    }

    // Add to stores array
    setStores([...stores, newStore])

    // Show success toast
    toast.success("Store Added", `Store ${data.name} has been added successfully.`)

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleEditStore = (data: any) => {
    // Update store in the array
    const updatedStores = stores.map((store) => (store.id === data.id ? { ...store, ...data } : store))

    setStores(updatedStores)

    // Show success toast
    toast.success("Store Updated", `Store ${data.name} has been updated successfully.`)

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleView = (store: any) => {
    setCurrentStore(store)
    setIsViewModalOpen(true)
  }

  const handleEdit = (store: any) => {
    setCurrentStore(store)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Store className="h-5 w-5 mr-2" />
          Store Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Store
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
                  Store ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Store Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Manager
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Staff Count
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
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{store.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.manager}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.staffCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={store.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(store)} className="text-red-600 hover:text-red-900 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleView(store)} className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Store Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Store"
        mode="add"
        itemType="Store"
        onSave={handleAddStore}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Store Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Select name="location">
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {mockLocations.map((location) => (
                  <SelectItem key={location.id} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="manager">Manager</Label>
            <Select name="manager">
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {mockManagers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.name}>
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="staffCount">Staff Count</Label>
            <Input id="staffCount" name="staffCount" type="number" min="0" defaultValue="0" />
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
                <SelectItem value="Under Renovation">Under Renovation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CrudModal>

      {/* Edit Store Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Store"
        mode="edit"
        itemType="Store"
        initialData={currentStore}
        onSave={handleEditStore}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="id">Store ID</Label>
            <Input id="id" name="id" defaultValue={currentStore?.id} disabled />
          </div>
          <div>
            <Label htmlFor="name">Store Name</Label>
            <Input id="name" name="name" defaultValue={currentStore?.name} required />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Select name="location" defaultValue={currentStore?.location}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {mockLocations.map((location) => (
                  <SelectItem key={location.id} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="manager">Manager</Label>
            <Select name="manager" defaultValue={currentStore?.manager}>
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {mockManagers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.name}>
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="staffCount">Staff Count</Label>
            <Input id="staffCount" name="staffCount" type="number" min="0" defaultValue={currentStore?.staffCount} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={currentStore?.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Under Renovation">Under Renovation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CrudModal>

      {/* View Store Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Store Details"
        mode="view"
        itemType="Store"
      >
        {currentStore && (
          <ViewDetails
            details={[
              { label: "Store ID", value: currentStore.id },
              { label: "Store Name", value: currentStore.name },
              { label: "Location", value: currentStore.location },
              { label: "Manager", value: currentStore.manager },
              { label: "Staff Count", value: currentStore.staffCount },
              { label: "Status", value: <StatusBadge status={currentStore.status} /> },
            ]}
          />
        )}
      </CrudModal>
    </div>
  )
}
