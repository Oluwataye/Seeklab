import { BarChart2 } from "lucide-react"

export default function ReportDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Report Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Report Management module. Use the sidebar navigation to access different report types.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Bank Reports</h2>
            <p className="text-gray-600 text-sm">View bank transaction and reconciliation reports.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Financial Statements</h2>
            <p className="text-gray-600 text-sm">Access income statements, balance sheets, and cash flow reports.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Inventory Reports</h2>
            <p className="text-gray-600 text-sm">View stock levels, movement, and valuation reports.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Expense Reports</h2>
            <p className="text-gray-600 text-sm">Track expenses by category, department, or time period.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Summary Reports</h2>
            <p className="text-gray-600 text-sm">View business performance summaries and KPI dashboards.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
