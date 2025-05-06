"use client"

import { useState } from "react"
import { Box, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrudModal } from "@/components/crud-modal"
import { CrudActions } from "@/components/crud-actions"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/lib/hooks/use-toast"

// Mock data for products
const initialProducts = [
  {
    id: "PRD-1001",
    name: "Laptop HP ProBook",
    category: "Electronics",
    brand: "HP",
    stock: 25,
    price: "NGN 450,000.00",
    status: "In Stock",
  },
  {
    id: "PRD-1002",
    name: "Office Desk Chair",
    category: "Furniture",
    brand: "Ergonomic",
    stock: 15,
    price: "NGN 75,000.00",
    status: "Low Stock",
  },
  {
    id: "PRD-1003",
    name: "Wireless Mouse",
    category: "Electronics",
    brand: "Logitech",
    stock: 50,
    price: "NGN 15,000.00",
    status: "In Stock",
  },
  {
    id: "PRD-1004",
    name: "External Hard Drive 1TB",
    category: "Electronics",
    brand: "Seagate",
    stock: 30,
    price: "NGN 35,000.00",
    status: "In Stock",
  },
  {
    id: "PRD-1005",
    name: "Wireless Keyboard",
    category: "Electronics",
    brand: "Logitech",
    stock: 40,
    price: "NGN 25,000.00",
    status: "In Stock",
  },
]

export default function ProductPage() {
  const [products, setProducts] = useState(initialProducts)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Form fields for Add/Edit Product
  const productFields = [
    { name: "name", label: "Product Name", type: "text", required: true },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: ["Electronics", "Furniture", "Office Supplies", "Stationery", "IT Equipment"],
    },
    { name: "brand", label: "Brand/Make", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "text", required: true },
    { name: "stock", label: "Initial Stock", type: "number", required: true },
    { name: "minStock", label: "Minimum Stock Level", type: "number", required: true },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      required: true,
      options: ["Piece", "Box", "Carton", "Dozen", "Pack"],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: ["In Stock", "Low Stock", "Out of Stock"],
    },
  ]

  // Handle add product
  const handleAddProduct = (data: any) => {
    const newProduct = {
      id: `PRD-${1000 + products.length + 1}`,
      ...data,
    }
    setProducts([...products, newProduct])
    setIsAddModalOpen(false)
    toast({
      title: "Product Added",
      description: `${data.name} has been added successfully.`,
    })
  }

  // Handle edit product
  const handleEditProduct = (data: any) => {
    setProducts(products.map((product) => (product.id === currentProduct.id ? { ...product, ...data } : product)))
    setIsEditModalOpen(false)
    toast({
      title: "Product Updated",
      description: `${data.name} has been updated successfully.`,
    })
  }

  // Handle delete product
  const handleDeleteProduct = () => {
    setProducts(products.filter((product) => product.id !== currentProduct.id))
    setIsDeleteModalOpen(false)
    toast({
      title: "Product Deleted",
      description: `${currentProduct.name} has been deleted successfully.`,
    })
  }

  // Handle view product
  const handleViewProduct = (product: any) => {
    setCurrentProduct(product)
    setIsViewModalOpen(true)
  }

  // Handle edit product
  const handleEditProductClick = (product: any) => {
    setCurrentProduct(product)
    setIsEditModalOpen(true)
  }

  // Handle delete product
  const handleDeleteProductClick = (product: any) => {
    setCurrentProduct(product)
    setIsDeleteModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Box className="h-5 w-5 mr-2" />
          Product Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full"
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
                  Product ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Brand
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={product.status}
                      statusMap={{
                        "In Stock": "success",
                        "Low Stock": "warning",
                        "Out of Stock": "error",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      onEdit={() => handleEditProductClick(product)}
                      onView={() => handleViewProduct(product)}
                      onDelete={() => handleDeleteProductClick(product)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Product"
        fields={productFields}
        onSubmit={handleAddProduct}
      />

      {/* Edit Product Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
        fields={productFields}
        initialData={currentProduct}
        onSubmit={handleEditProduct}
      />

      {/* View Product Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Product Details"
        isViewMode={true}
      >
        {currentProduct && (
          <ViewDetails
            details={[
              { label: "Product ID", value: currentProduct.id },
              { label: "Product Name", value: currentProduct.name },
              { label: "Category", value: currentProduct.category },
              { label: "Brand", value: currentProduct.brand },
              { label: "Stock", value: currentProduct.stock },
              { label: "Price", value: currentProduct.price },
              { label: "Status", value: currentProduct.status },
              { label: "Description", value: currentProduct.description || "N/A" },
              { label: "Minimum Stock Level", value: currentProduct.minStock || "N/A" },
              { label: "Unit", value: currentProduct.unit || "N/A" },
            ]}
          />
        )}
      </CrudModal>

      {/* Delete Confirmation Modal */}
      <CrudModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
        isDeleteMode={true}
        onDelete={handleDeleteProduct}
      >
        {currentProduct && (
          <p>
            Are you sure you want to delete the product <strong>{currentProduct.name}</strong>? This action cannot be
            undone.
          </p>
        )}
      </CrudModal>
    </div>
  )
}
