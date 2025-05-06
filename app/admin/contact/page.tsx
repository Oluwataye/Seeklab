import { Phone } from "lucide-react"

export default function ContactDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Contact Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Contact Management module. Use the sidebar navigation to access different contact types.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Contractors</h2>
            <p className="text-gray-600 text-sm">Manage contractors and service providers.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Lenders</h2>
            <p className="text-gray-600 text-sm">Manage financial institutions and lenders.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Suppliers</h2>
            <p className="text-gray-600 text-sm">Manage product and service suppliers.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Customers</h2>
            <p className="text-gray-600 text-sm">Manage customer information and relationships.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
