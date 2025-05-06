import { FileSpreadsheet } from "lucide-react"

export default function ExpenditureDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Expenditure Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Expenditure Management module. Use the sidebar navigation to access different expenditure
          functions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Purchase</h2>
            <p className="text-gray-600 text-sm">Manage purchase orders and vendor payments.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Expenses</h2>
            <p className="text-gray-600 text-sm">Track and manage business expenses.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Expenses Category</h2>
            <p className="text-gray-600 text-sm">Organize expenses by categories for better tracking.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
