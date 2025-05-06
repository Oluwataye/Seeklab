"use client"

import { useState } from "react"
import { User, Plus, Lock, Mail, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CrudModal from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import StatusBadge from "@/components/status-badge"
import { useToastContext } from "@/components/toast-provider"

// Mock data for users
const mockUsers = [
  {
    id: "USR-1001",
    username: "admin",
    email: "admin@osoft.com",
    role: "Administrator",
    status: "Active",
  },
  {
    id: "USR-1002",
    username: "manager",
    email: "manager@osoft.com",
    role: "Manager",
    status: "Active",
  },
  {
    id: "USR-1003",
    username: "accountant",
    email: "accountant@osoft.com",
    role: "Accountant",
    status: "Active",
  },
  {
    id: "USR-1004",
    username: "clerk",
    email: "clerk@osoft.com",
    role: "Clerk",
    status: "Inactive",
  },
  {
    id: "USR-1005",
    username: "supervisor",
    email: "supervisor@osoft.com",
    role: "Supervisor",
    status: "Active",
  },
]

// Mock data for roles (for dropdown)
const mockRoles = [
  { id: "ROLE-101", name: "Administrator" },
  { id: "ROLE-102", name: "Manager" },
  { id: "ROLE-103", name: "Accountant" },
  { id: "ROLE-104", name: "Clerk" },
  { id: "ROLE-105", name: "Supervisor" },
]

export default function AccountPage() {
  const { toast } = useToastContext()
  const [users, setUsers] = useState(mockUsers)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const handleAddUser = (data: any) => {
    // Generate a new ID
    const newId = `USR-${1006 + users.length - 5}`

    // Create new user object
    const newUser = {
      id: newId,
      username: data.username,
      email: data.email,
      role: data.role,
      status: data.status,
    }

    // Add to users array
    setUsers([...users, newUser])

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleEditUser = (data: any) => {
    // Update user in the array
    const updatedUsers = users.map((user) => (user.id === data.id ? { ...user, ...data } : user))

    setUsers(updatedUsers)

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleView = (user: any) => {
    setCurrentUser(user)
    setIsViewModalOpen(true)
  }

  const handleEdit = (user: any) => {
    setCurrentUser(user)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <User className="h-5 w-5 mr-2" />
          User Account Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add User
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
                  User ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Username
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(user)} className="text-red-600 hover:text-red-900 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleView(user)} className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
        mode="add"
        itemType="User"
        onSave={handleAddUser}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <User className="h-4 w-4" />
              </span>
              <Input id="username" name="username" className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Mail className="h-4 w-4" />
              </span>
              <Input id="email" name="email" type="email" className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Lock className="h-4 w-4" />
              </span>
              <Input id="password" name="password" type="password" className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <UserCheck className="h-4 w-4" />
              </span>
              <Select name="role">
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {mockRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

      {/* Edit User Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        mode="edit"
        itemType="User"
        initialData={currentUser}
        onSave={handleEditUser}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="id">User ID</Label>
            <Input id="id" name="id" defaultValue={currentUser?.id} disabled />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <User className="h-4 w-4" />
              </span>
              <Input id="username" name="username" defaultValue={currentUser?.username} className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentUser?.email}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <UserCheck className="h-4 w-4" />
              </span>
              <Select name="role" defaultValue={currentUser?.role}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {mockRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={currentUser?.status}>
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

      {/* View User Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Details"
        mode="view"
        itemType="User"
      >
        {currentUser && (
          <ViewDetails
            details={[
              { label: "User ID", value: currentUser.id },
              { label: "Username", value: currentUser.username },
              { label: "Email", value: currentUser.email },
              { label: "Role", value: currentUser.role },
              { label: "Status", value: <StatusBadge status={currentUser.status} /> },
            ]}
          />
        )}
      </CrudModal>
    </div>
  )
}
