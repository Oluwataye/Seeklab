"use client"

import { useState } from "react"
import { FolderOpen, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CrudActions from "@/components/crud-actions"
import CrudModal from "@/components/crud-modal"
import ViewDetails from "@/components/view-details"
import { useToastContext } from "@/components/toast-provider"

// Sample data
const initialDepartments = [
  {
    id: "DEPT-101",
    name: "Information Technology",
    head: "John Smith",
    employeeCount: 12,
    description: "Responsible for all IT infrastructure and software development",
    location: "Head Office",
    budget: "NGN 25,000,000",
    established: "2020-01-15",
  },
  {
    id: "DEPT-102",
    name: "Human Resources",
    head: "Sarah Johnson",
    employeeCount: 8,
    description: "Manages recruitment, employee relations, and benefits",
    location: "Head Office",
    budget: "NGN 15,000,000",
    established: "2020-01-15",
  },
  {
    id: "DEPT-103",
    name: "Finance",
    head: "Michael Brown",
    employeeCount: 15,
    description: "Handles accounting, budgeting, and financial reporting",
    location: "Head Office",
    budget: "NGN 20,000,000",
    established: "2020-01-15",
  },
  {
    id: "DEPT-104",
    name: "Marketing",
    head: "Emily Davis",
    employeeCount: 10,
    description: "Manages brand, advertising, and market research",
    location: "Branch 1",
    budget: "NGN 18,000,000",
    established: "2021-03-10",
  },
  {
    id: "DEPT-105",
    name: "Operations",
    head: "Robert Wilson",
    employeeCount: 20,
    description: "Oversees day-to-day business operations",
    location: "Head Office",
    budget: "NGN 30,000,000",
    established: "2020-01-15",
  },
]

export default function DepartmentPage() {
  const { toast } = useToastContext()
  const [departments, setDepartments] = useState(initialDepartments)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState<any>(null)

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddDepartment = (data: any) => {
    // Create new department
    const id = `DEPT-${106 + departments.length}`

    const department = {
      id,
      name: data.name,
      head: data.head,
      employeeCount: Number.parseInt(data.employeeCount) || 0,
      description: data.description,
      location: data.location,
      budget: data.budget,
      established: data.established,
    }

    // Add to list
    setDepartments([...departments, department])
    return Promise.resolve()
  }

  const handleEditDepartment = (data: any) => {
    // Update department
    setDepartments(
      departments.map((dept) =>
        dept.id === data.id
          ? {
              ...dept,
              name: data.name,
              head: data.head,
              employeeCount: Number.parseInt(data.employeeCount) || dept.employeeCount,
              description: data.description,
              location: data.location,
              budget: data.budget,
              established: data.established,
            }
          : dept,
      ),
    )
    return Promise.resolve()
  }

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter((dept) => dept.id !== id))
    toast.success("Department Deleted", "Department has been deleted successfully")
  }

  const openEditModal = (department: any) => {
    setCurrentDepartment(department)
    setIsEditModalOpen(true)
  }

  const openViewModal = (department: any) => {
    setCurrentDepartment(department)
    setIsViewModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <FolderOpen className="h-5 w-5 mr-2" />
          Department Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Department
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search departments..."
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
                  Department ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Department Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Head of Department
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Number of Employees
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
              {filteredDepartments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{department.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{department.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{department.head}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{department.employeeCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={department}
                      itemType="Department"
                      onEdit={() => openEditModal(department)}
                      onView={() => openViewModal(department)}
                      onDelete={() => handleDeleteDepartment(department.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Department Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Department"
        mode="add"
        itemType="Department"
        onSave={handleAddDepartment}
      >
        <div>
          <Label htmlFor="name">Department Name</Label>
          <Input id="name" name="name" required />
        </div>

        <div>
          <Label htmlFor="head">Head of Department</Label>
          <Input id="head" name="head" required />
        </div>

        <div>
          <Label htmlFor="employeeCount">Number of Employees</Label>
          <Input id="employeeCount" name="employeeCount" type="number" min="0" defaultValue="0" />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue="Head Office" />
        </div>

        <div>
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" name="budget" placeholder="NGN 0.00" />
        </div>

        <div>
          <Label htmlFor="established">Date Established</Label>
          <Input id="established" name="established" type="date" />
        </div>
      </CrudModal>

      {/* Edit Department Modal */}
      {currentDepartment && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Department: ${currentDepartment.name}`}
          mode="edit"
          itemType="Department"
          onSave={handleEditDepartment}
          initialData={currentDepartment}
        >
          <input type="hidden" name="id" value={currentDepartment.id} />

          <div>
            <Label htmlFor="edit-name">Department Name</Label>
            <Input id="edit-name" name="name" defaultValue={currentDepartment.name} required />
          </div>

          <div>
            <Label htmlFor="edit-head">Head of Department</Label>
            <Input id="edit-head" name="head" defaultValue={currentDepartment.head} required />
          </div>

          <div>
            <Label htmlFor="edit-employeeCount">Number of Employees</Label>
            <Input
              id="edit-employeeCount"
              name="employeeCount"
              type="number"
              min="0"
              defaultValue={currentDepartment.employeeCount}
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input id="edit-description" name="description" defaultValue={currentDepartment.description} />
          </div>

          <div>
            <Label htmlFor="edit-location">Location</Label>
            <Input id="edit-location" name="location" defaultValue={currentDepartment.location} />
          </div>

          <div>
            <Label htmlFor="edit-budget">Budget</Label>
            <Input id="edit-budget" name="budget" defaultValue={currentDepartment.budget} />
          </div>

          <div>
            <Label htmlFor="edit-established">Date Established</Label>
            <Input id="edit-established" name="established" type="date" defaultValue={currentDepartment.established} />
          </div>
        </CrudModal>
      )}

      {/* View Department Modal */}
      {currentDepartment && (
        <CrudModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Department Details: ${currentDepartment.name}`}
          mode="view"
          itemType="Department"
        >
          <div className="space-y-4">
            <ViewDetails label="Department ID" value={currentDepartment.id} />
            <ViewDetails label="Department Name" value={currentDepartment.name} />
            <ViewDetails label="Head of Department" value={currentDepartment.head} />
            <ViewDetails label="Number of Employees" value={currentDepartment.employeeCount} />
            <ViewDetails label="Description" value={currentDepartment.description} />
            <ViewDetails label="Location" value={currentDepartment.location} />
            <ViewDetails label="Budget" value={currentDepartment.budget} />
            <ViewDetails label="Date Established" value={currentDepartment.established} />
          </div>
        </CrudModal>
      )}
    </div>
  )
}
