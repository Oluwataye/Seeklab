"use client"

import { useState } from "react"
import { MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CrudModal from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import StatusBadge from "@/components/status-badge"
import { useToastContext } from "@/components/toast-provider"

// Mock data for locations
const mockLocations = [
  {
    id: "LOC-101",
    name: "Head Office",
    address: "123 Main Street, Lagos",
    status: "Active",
  },
  {
    id: "LOC-102",
    name: "Branch 1",
    address: "45 Park Avenue, Abuja",
    status: "Active",
  },
  {
    id: "LOC-103",
    name: "Branch 2",
    address: "78 Market Road, Port Harcourt",
    status: "Active",
  },
  {
    id: "LOC-104",
    name: "Warehouse",
    address: "15 Industrial Way, Kano",
    status: "Inactive",
  },
]

export default function LocationPage() {
  const { toast } = useToastContext()
  const [locations, setLocations] = useState(mockLocations)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<any>(null)

  const handleAddLocation = (data: any) => {
    // Generate a new ID
    const newId = `LOC-${105 + locations.length}`

    // Create new location object
    const newLocation = {
      id: newId,
      name: data.name,
      address: data.address,
      status: data.status,
    }

    // Add to locations array
    setLocations([...locations, newLocation])

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleEditLocation = (data: any) => {
    // Update location in the array
    const updatedLocations = locations.map((location) =>
      location.id === data.id ? { ...location, ...data } : location,
    )

    setLocations(updatedLocations)

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleView = (location: any) => {
    setCurrentLocation(location)
    setIsViewModalOpen(true)
  }

  const handleEdit = (location: any) => {
    setCurrentLocation(location)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Location
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
                  Location ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Address
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
              {locations.map((location) => (
                <tr key={location.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{location.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={location.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(location)} className="text-red-600 hover:text-red-900 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleView(location)} className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Location Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Location"
        mode="add"
        itemType="Location"
        onSave={handleAddLocation}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Location Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" required />
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

      {/* Edit Location Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Location"
        mode="edit"
        itemType="Location"
        initialData={currentLocation}
        onSave={handleEditLocation}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="id">Location ID</Label>
            <Input id="id" name="id" defaultValue={currentLocation?.id} disabled />
          </div>
          <div>
            <Label htmlFor="name">Location Name</Label>
            <Input id="name" name="name" defaultValue={currentLocation?.name} required />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={currentLocation?.address} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={currentLocation?.status}>
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

      {/* View Location Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Location Details"
        mode="view"
        itemType="Location"
      >
        {currentLocation && (
          <ViewDetails
            details={[
              { label: "Location ID", value: currentLocation.id },
              { label: "Location Name", value: currentLocation.name },
              { label: "Address", value: currentLocation.address },
              { label: "Status", value: <StatusBadge status={currentLocation.status} /> },
            ]}
          />
        )}
      </CrudModal>
    </div>
  )
}
