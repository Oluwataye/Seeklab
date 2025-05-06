"use client"

import { useState } from "react"
import { UserCheck, Plus, Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { useToastContext } from "@/components/toast-provider"

// Mock data for roles
const initialRoles = [
  {
    id: "ROLE-101",
    name: "Administrator",
    description: "Full system access",
    usersCount: 2,
  },
  {
    id: "ROLE-102",
    name: "Manager",
    description: "Department management access",
    usersCount: 5,
  },
  {
    id: "ROLE-103",
    name: "Accountant",
    description: "Financial system access",
    usersCount: 3,
  },
  {
    id: "ROLE-104",
    name: "Clerk",
    description: "Data entry access",
    usersCount: 8,
  },
  {
    id: "ROLE-105",
    name: "Supervisor",
    description: "Team supervision access",
    usersCount: 4,
  },
]

export default function RolePage() {
  const { toast } = useToastContext()
  const [roles, setRoles] = useState(initialRoles)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<any>(null)

  // Filter roles based on search term
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddRole = (data: any) => {
    // Generate a new ID
    const newId = `ROLE-${106 + roles.length - 5}`

    // Create new role object
    const newRole = {
      id: newId,
      name: data.name,
      description: data.description,
      usersCount: 0, // New role has no users yet
    }

    // Add to roles array
    setRoles([...roles, newRole])

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleEditRole = (data: any) => {
    // Update role in the array
    const updatedRoles = roles.map((role) =>
      role.id === data.id
        ? {
            ...role,
            name: data.name,
            description: data.description,
          }
        : role,
    )

    setRoles(updatedRoles)

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleDeleteRole = (id: string) => {
    // Remove role from the array
    setRoles(roles.filter((role) => role.id !== id))

    // Show success toast
    toast.success("Role Deleted", "Role has been deleted successfully")
  }

  const handleView = (role: any) => {
    setCurrentRole(role)
    setIsViewModalOpen(true)
  }

  const handleEdit = (role: any) => {
    setCurrentRole(role)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <UserCheck className="h-5 w-5 mr-2" />
          Role Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Role
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search roles..."
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
                  Role ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role Name
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
                  Users Count
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
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.usersCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(role)} className="text-red-600 hover:text-red-900 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleView(role)} className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Role"
        mode="add"
        itemType="Role"
        onSave={handleAddRole}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Role Name</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Shield className="h-4 w-4" />
              </span>
              <Input id="name" name="name" className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Role description and permissions"
              className="resize-none h-24"
            />
          </div>
        </div>
      </CrudModal>

      {/* Edit Role Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Role"
        mode="edit"
        itemType="Role"
        initialData={currentRole}
        onSave={handleEditRole}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="id">Role ID</Label>
            <Input id="id" name="id" defaultValue={currentRole?.id} disabled />
          </div>
          <div>
            <Label htmlFor="name">Role Name</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Shield className="h-4 w-4" />
              </span>
              <Input id="name" name="name" defaultValue={currentRole?.name} className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={currentRole?.description}
              className="resize-none h-24"
            />
          </div>
          <div>
            <Label htmlFor="usersCount">Users Count</Label>
            <Input id="usersCount" name="usersCount" defaultValue={currentRole?.usersCount} disabled />
            <p className="text-xs text-gray-500 mt-1">
              This field is automatically updated when users are assigned to this role.
            </p>
          </div>
        </div>
      </CrudModal>

      {/* View Role Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Role Details"
        mode="view"
        itemType="Role"
      >
        {currentRole && (
          <ViewDetails
            details={[
              { label: "Role ID", value: currentRole.id },
              { label: "Role Name", value: currentRole.name },
              { label: "Description", value: currentRole.description },
              { label: "Users Count", value: currentRole.usersCount },
            ]}
          />
        )}
      </CrudModal>
    </div>
  )
}
