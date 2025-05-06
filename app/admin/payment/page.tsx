import { CreditCard } from "lucide-react"

export default function PaymentDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Payment Management module. Use the sidebar navigation to access different payment functions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Deposits</h2>
            <p className="text-gray-600 text-sm">Manage deposits and track incoming funds.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Miscellaneous Income</h2>
            <p className="text-gray-600 text-sm">Track and manage miscellaneous income sources.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
