import { Store } from "lucide-react"

export default function StoreDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <Store className="h-5 w-5 mr-2" />
          Store Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Store Management module. Use the sidebar navigation to access different store functions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Store Management</h2>
            <p className="text-gray-600 text-sm">Manage store locations, inventory, and operations.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
