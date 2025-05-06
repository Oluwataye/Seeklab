import { BarChart2, DollarSign, Users, Package, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RevenueChart from "@/components/revenue-chart"

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Dashboard Overview
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-xl font-bold">₦15,890,500</h3>
                <p className="text-xs text-green-600">+12.5% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <h3 className="text-xl font-bold">1,250</h3>
                <p className="text-xs text-green-600">+5.3% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <h3 className="text-xl font-bold">450</h3>
                <p className="text-xs text-green-600">+8.1% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-3">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-xl font-bold">890</h3>
                <p className="text-xs text-red-600">-2.4% from last month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueChart title="Monthly Revenue" type="monthly" />
          <RevenueChart title="Yearly Revenue Comparison" type="yearly" />
        </div>

        {/* Quick Access */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              href="/admin/project/projects"
              className="flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition-shadow"
            >
              <ShoppingCart className="h-6 w-6 text-red-600 mb-2" />
              <span className="text-sm text-center">New Project</span>
            </Link>

            <Link
              href="/admin/inventory/product"
              className="flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition-shadow"
            >
              <Package className="h-6 w-6 text-red-600 mb-2" />
              <span className="text-sm text-center">Add Product</span>
            </Link>

            <Link
              href="/admin/contact/customer"
              className="flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition-shadow"
            >
              <Users className="h-6 w-6 text-red-600 mb-2" />
              <span className="text-sm text-center">Add Customer</span>
            </Link>

            <Link
              href="/admin/report"
              className="flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition-shadow"
            >
              <BarChart2 className="h-6 w-6 text-red-600 mb-2" />
              <span className="text-sm text-center">Reports</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Activity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { activity: "New Project", user: "John Doe", time: "10 minutes ago", type: "project" },
                  { activity: "Product Updated", user: "Sarah Johnson", time: "25 minutes ago", type: "product" },
                  { activity: "New Customer", user: "Admin User", time: "1 hour ago", type: "customer" },
                  { activity: "Inventory Adjusted", user: "Michael Brown", time: "2 hours ago", type: "inventory" },
                  { activity: "Payment Received", user: "Emily Davis", time: "3 hours ago", type: "payment" },
                ].map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.activity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
