"use client"

import { useState } from "react"
import { Grid, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"

// Sample data for categories
const initialCategories = [
  {
    id: "CAT-101",
    name: "Electronics",
    description: "Electronic devices and gadgets",
    brand: "Various",
    productsCount: "45",
    status: "active",
  },
  {
    id: "CAT-102",
    name: "Furniture",
    description: "Office and home furniture",
    brand: "IKEA",
    productsCount: "30",
    status: "active",
  },
  {
    id: "CAT-103",
    name: "Office Supplies",
    description: "General office supplies",
    brand: "Staples",
    productsCount: "120",
    status: "active",
  },
  {
    id: "CAT-104",
    name: "Books",
    description: "Books and publications",
    brand: "Various Publishers",
    productsCount: "85",
    status: "active",
  },
  {
    id: "CAT-105",
    name: "Computer Accessories",
    description: "Computer peripherals and accessories",
    brand: "Logitech",
    productsCount: "65",
    status: "active",
  },
]

export default function CategoryPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<any>(null)

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle add category
  const handleAddCategory = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    // Set default products count for new category
    data.productsCount = "0"

    const newCategory = {
      id: `CAT-${106 + categories.length}`,
      ...data,
    }

    setCategories([...categories, newCategory])
    setIsAddModalOpen(false)
  }

  // Handle edit category
  const handleEditCategory = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    setCategories(
      categories.map((category) => (category.id === currentCategory.id ? { ...category, ...data } : category)),
    )

    setIsEditModalOpen(false)
  }

  // Handle delete category
  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id))
  }

  // Handle view category
  const handleViewCategory = (category: any) => {
    setCurrentCategory(category)
    setIsViewModalOpen(true)
  }

  // Handle edit category
  const handleEditCategoryClick = (category: any) => {
    setCurrentCategory(category)
    setIsEditModalOpen(true)
  }

  // Form fields for add/edit modal - Including Brand/Make field
  const formFields = [
    { name: "name", label: "Category Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "brand", label: "Brand/Make", type: "text", required: true }, // Added Brand/Make field
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Grid className="h-5 w-5 mr-2" />
          Category Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
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
                  Name
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
                  Brand/Make
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Products Count
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.productsCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={category.status} />
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
        onSubmit={handleAddCategory}
        title="Add New Category"
        mode="add"
        itemType="Category"
        fields={formFields}
      />

      {/* Edit Category Modal */}
      {currentCategory && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditCategory}
          title="Edit Category"
          mode="edit"
          itemType="Category"
          fields={formFields}
          initialData={currentCategory}
        />
      )}

      {/* View Category Modal */}
      {currentCategory && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Category Details"
          details={[
            { label: "Category ID", value: currentCategory.id },
            { label: "Name", value: currentCategory.name },
            { label: "Description", value: currentCategory.description },
            { label: "Brand/Make", value: currentCategory.brand },
            { label: "Products Count", value: currentCategory.productsCount },
            { label: "Status", value: <StatusBadge status={currentCategory.status} /> },
          ]}
        />
      )}
    </div>
  )
}
