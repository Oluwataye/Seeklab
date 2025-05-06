import { FileText, CreditCard } from "lucide-react"

export default function PayrollDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Payroll Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-6">
          Welcome to the Payroll Management module. Use the sidebar navigation to access different payroll functions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-red-600 mr-3" />
              <h3 className="text-xl font-medium">Payroll Templates</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Create and manage payroll templates for different employee types and payment periods.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-red-500" />
                <span>Template</span>
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <CreditCard className="h-8 w-8 text-red-600 mr-3" />
              <h3 className="text-xl font-medium">Payroll Payments</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Process and manage employee payments, including salaries, bonuses, and deductions.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-red-500" />
                <span>Payment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
