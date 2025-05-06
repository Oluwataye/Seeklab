import { DollarSign } from "lucide-react"

export default function FinanceDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Finance Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Finance Management module. Use the sidebar navigation to access different finance functions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Discount Groups</h2>
            <p className="text-gray-600 text-sm">Manage discount groups for different customer categories.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Tax Groups</h2>
            <p className="text-gray-600 text-sm">Configure tax rates and groups for different products and services.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Promotional Codes</h2>
            <p className="text-gray-600 text-sm">Create and manage promotional codes and special offers.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Accounts</h2>
            <p className="text-gray-600 text-sm">Manage financial accounts and ledgers.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Staff Loans</h2>
            <p className="text-gray-600 text-sm">Track and manage loans provided to staff members.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Company Loans</h2>
            <p className="text-gray-600 text-sm">Track and manage loans taken by the company.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Transfers</h2>
            <p className="text-gray-600 text-sm">Manage fund transfers between accounts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
