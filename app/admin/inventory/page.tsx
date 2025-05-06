import { Package } from "lucide-react"

export default function InventoryDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Inventory Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Inventory Management module. Use the sidebar navigation to access different inventory
          functions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Products</h2>
            <p className="text-gray-600 text-sm">Manage product catalog and details.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Stock Management</h2>
            <p className="text-gray-600 text-sm">Handle stock purchases, transfers, and adjustments.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Warehouses</h2>
            <p className="text-gray-600 text-sm">Manage warehouse locations and inventory.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Categories</h2>
            <p className="text-gray-600 text-sm">Organize products with categories and subcategories.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Brands & Units</h2>
            <p className="text-gray-600 text-sm">Manage product brands and measurement units.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Authors</h2>
            <p className="text-gray-600 text-sm">Manage authors for book inventory.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
