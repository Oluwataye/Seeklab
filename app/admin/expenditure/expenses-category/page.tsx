"use client"

import { useState } from "react"
import { ClipboardList, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"

// Sample data
const initialCategories = [
  {
    id: "EXCAT-101",
    name: "Office Supplies",
    description: "Stationery, printer supplies, etc.",
    budgetAllocation: "NGN 500,000.00",
    status: "Active",
    createdDate: "01/01/2025",
    lastUpdated: "15/03/2025",
  },
  {
    id: "EXCAT-102",
    name: "Travel",
    description: "Business travel expenses",
    budgetAllocation: "NGN 2,000,000.00",
    status: "Active",
    createdDate: "01/01/2025",
    lastUpdated: "10/02/2025",
  },
  {
    id: "EXCAT-103",
    name: "Utilities",
    description: "Electricity, water, internet bills",
    budgetAllocation: "NGN 1,500,000.00",
    status: "Active",
    createdDate: "01/01/2025",
    lastUpdated: "05/03/2025",
  },
  {
    id: "EXCAT-104",
    name: "Maintenance",
    description: "Equipment and facility maintenance",
    budgetAllocation: "NGN 800,000.00",
    status: "Active",
    createdDate: "01/01/2025",
    lastUpdated: "20/02/2025",
  },
  {
    id: "EXCAT-105",
    name: "Marketing",
    description: "Advertising and promotional expenses",
    budgetAllocation: "NGN 3,000,000.00",
    status: "Active",
    createdDate: "01/01/2025",
    lastUpdated: "25/03/2025",
  },
  {
    id: "EXCAT-106",
    name: "Rent",
    description: "Office and facility rent",
    budgetAllocation: "NGN 5,000,000.00",
    status: "Active",
    createdDate: "01/01/2025",
    lastUpdated: "01/03/2025",
  },
  {
    id: "EXCAT-107",
    name: "Salaries",
    description: "Employee salaries and wages",
    budgetAllocation: "NGN 15,000,000.00",
    status: "Active",
    createdDate: "01/01/2025",
    lastUpdated: "01/03/2025",
  },
]

export default function ExpensesCategoryPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<any>(null)

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Form fields for add/edit category
  const formFields = [
    { name: "name", label: "Category Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "budgetAllocation", label: "Budget Allocation", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
      required: true,
    },
  ]

  // Handle add category
  const handleAddCategory = (formData: any) => {
    const newCategory = {
      id: `EXCAT-${100 + categories.length + 1}`,
      ...formData,
      createdDate: new Date().toLocaleDateString("en-GB"),
      lastUpdated: new Date().toLocaleDateString("en-GB"),
    }
    setCategories([...categories, newCategory])
    setIsAddModalOpen(false)
  }

  // Handle edit category
  const handleEditCategory = (formData: any) => {
    const updatedCategories = categories.map((category) =>
      category.id === currentCategory.id
        ? {
            ...category,
            ...formData,
            lastUpdated: new Date().toLocaleDateString("en-GB"),
          }
        : category,
    )
    setCategories(updatedCategories)
    setIsEditModalOpen(false)
  }

  // Handle delete category
  const handleDeleteCategory = (id: string) => {
    const updatedCategories = categories.filter((category) => category.id !== id)
    setCategories(updatedCategories)
  }

  // Handle view category
  const handleViewCategory = (category: any) => {
    setCurrentCategory(category)
    setIsViewModalOpen(true)
  }

  // Handle edit category click
  const handleEditCategoryClick = (category: any) => {
    setCurrentCategory(category)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <ClipboardList className="h-5 w-5 mr-2" />
          Expenses Category Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search categories..."
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
                  Category ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category Name
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
                  Budget Allocation
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
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.budgetAllocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={category.status}
                      statusMap={{
                        Active: "success",
                        Inactive: "error",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={category}
                      itemType="Category"
                      onView={() => handleViewCategory(category)}
                      onEdit={() => handleEditCategoryClick(category)}
                      onDelete={() => handleDeleteCategory(category.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense Category"
        fields={formFields}
        onSubmit={handleAddCategory}
        mode="add"
        itemType="Category"
      />

      {/* Edit Category Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Expense Category"
        fields={formFields}
        initialData={currentCategory}
        onSubmit={handleEditCategory}
        mode="edit"
        itemType="Category"
      />

      {/* View Category Modal */}
      {currentCategory && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Category Details: ${currentCategory.name}`}
          details={[
            { label: "Category ID", value: currentCategory.id },
            { label: "Category Name", value: currentCategory.name },
            { label: "Description", value: currentCategory.description },
            { label: "Budget Allocation", value: currentCategory.budgetAllocation },
            { label: "Status", value: currentCategory.status },
            { label: "Created Date", value: currentCategory.createdDate },
            { label: "Last Updated", value: currentCategory.lastUpdated },
          ]}
        />
      )}
    </div>
  )
}
