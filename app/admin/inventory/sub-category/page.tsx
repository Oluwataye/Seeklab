"use client"

import { useState } from "react"
import { Grid3x3, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { CrudActions } from "@/components/crud-actions"
import { StatusBadge } from "@/components/status-badge"

// Sample data for subcategories
const initialSubCategories = [
  {
    id: "SCAT-1001",
    name: "Laptops",
    parentCategory: "Electronics",
    description: "Portable computers",
    productsCount: "25",
    status: "active",
  },
  {
    id: "SCAT-1002",
    name: "Office Chairs",
    parentCategory: "Furniture",
    description: "Chairs for office use",
    productsCount: "15",
    status: "active",
  },
  {
    id: "SCAT-1003",
    name: "Stationery",
    parentCategory: "Office Supplies",
    description: "Paper, pens and other stationery items",
    productsCount: "45",
    status: "active",
  },
  {
    id: "SCAT-1004",
    name: "Fiction Books",
    parentCategory: "Books",
    description: "Fiction and literature books",
    productsCount: "30",
    status: "active",
  },
  {
    id: "SCAT-1005",
    name: "Keyboards",
    parentCategory: "Computer Accessories",
    description: "Computer keyboards and accessories",
    productsCount: "20",
    status: "active",
  },
]

// Sample parent categories for dropdown
const parentCategories = [
  { value: "Electronics", label: "Electronics" },
  { value: "Furniture", label: "Furniture" },
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Books", label: "Books" },
  { value: "Computer Accessories", label: "Computer Accessories" },
]

export default function SubCategoryPage() {
  const [subCategories, setSubCategories] = useState(initialSubCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentSubCategory, setCurrentSubCategory] = useState<any>(null)

  // Filter subcategories based on search term
  const filteredSubCategories = subCategories.filter(
    (subCategory) =>
      subCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subCategory.parentCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subCategory.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle add subcategory
  const handleAddSubCategory = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    const newSubCategory = {
      id: `SCAT-${1006 + subCategories.length}`,
      ...data,
    }

    setSubCategories([...subCategories, newSubCategory])
    setIsAddModalOpen(false)
  }

  // Handle edit subcategory
  const handleEditSubCategory = (formData: FormData) => {
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    setSubCategories(
      subCategories.map((subCategory) =>
        subCategory.id === currentSubCategory.id ? { ...subCategory, ...data } : subCategory,
      ),
    )

    setIsEditModalOpen(false)
  }

  // Handle delete subcategory
  const handleDeleteSubCategory = (id: string) => {
    setSubCategories(subCategories.filter((subCategory) => subCategory.id !== id))
  }

  // Handle view subcategory
  const handleViewSubCategory = (subCategory: any) => {
    setCurrentSubCategory(subCategory)
    setIsViewModalOpen(true)
  }

  // Handle edit subcategory
  const handleEditSubCategoryClick = (subCategory: any) => {
    setCurrentSubCategory(subCategory)
    setIsEditModalOpen(true)
  }

  // Form fields for add/edit modal - Including Products Count field
  const formFields = [
    { name: "name", label: "Sub Category Name", type: "text", required: true },
    {
      name: "parentCategory",
      label: "Parent Category",
      type: "select",
      required: true,
      options: parentCategories,
    },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "productsCount", label: "Products Count", type: "text", required: true }, // Added Products Count field
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
          <Grid3x3 className="h-5 w-5 mr-2" />
          Sub Category Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Sub Category
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search sub categories..."
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
                  Sub Category ID
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
                  Parent Category
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
              {filteredSubCategories.map((subCategory) => (
                <tr key={subCategory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subCategory.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subCategory.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subCategory.parentCategory}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subCategory.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subCategory.productsCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={subCategory.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={subCategory}
                      itemType="Sub Category"
                      onView={() => handleViewSubCategory(subCategory)}
                      onEdit={() => handleEditSubCategoryClick(subCategory)}
                      onDelete={() => handleDeleteSubCategory(subCategory.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sub Category Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubCategory}
        title="Add New Sub Category"
        mode="add"
        itemType="Sub Category"
        fields={formFields}
      />

      {/* Edit Sub Category Modal */}
      {currentSubCategory && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubCategory}
          title="Edit Sub Category"
          mode="edit"
          itemType="Sub Category"
          fields={formFields}
          initialData={currentSubCategory}
        />
      )}

      {/* View Sub Category Modal */}
      {currentSubCategory && (
        <ViewDetails
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Sub Category Details"
          details={[
            { label: "Sub Category ID", value: currentSubCategory.id },
            { label: "Name", value: currentSubCategory.name },
            { label: "Parent Category", value: currentSubCategory.parentCategory },
            { label: "Description", value: currentSubCategory.description },
            { label: "Products Count", value: currentSubCategory.productsCount },
            { label: "Status", value: <StatusBadge status={currentSubCategory.status} /> },
          ]}
        />
      )}
    </div>
  )
}
