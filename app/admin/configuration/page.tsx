import ConfigurationRedirect from "./redirect"
import { Settings, List, Sliders, MapPin, Building, Store, UserCheck, Globe, Landmark, FormInput } from "lucide-react"

export default function ConfigurationPage() {
  return (
    <>
      <ConfigurationRedirect />
      <div>
        <div className="bg-red-600 text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-medium flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuration
          </h1>
        </div>

        <div className="bg-white rounded-b-lg p-6 shadow-md">
          <p className="text-gray-700 mb-6">
            Welcome to the Configuration module. Use the sidebar navigation to access different configuration options.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* General Settings Section */}
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Sliders className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-medium">General Settings</h3>
              </div>
              <p className="text-gray-700 mb-4">Configure system-wide settings, lists, and preferences.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <List className="h-4 w-4 mr-2 text-red-500" />
                  <span>Lists</span>
                </li>
                <li className="flex items-center">
                  <Sliders className="h-4 w-4 mr-2 text-red-500" />
                  <span>Settings</span>
                </li>
                <li className="flex items-center">
                  <FormInput className="h-4 w-4 mr-2 text-red-500" />
                  <span>Form Fields</span>
                </li>
              </ul>
            </div>

            {/* Company & Location Section */}
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Building className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-medium">Company & Location</h3>
              </div>
              <p className="text-gray-700 mb-4">Manage company information, locations, and branches.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-red-500" />
                  <span>Company</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-red-500" />
                  <span>Location</span>
                </li>
                <li className="flex items-center">
                  <Store className="h-4 w-4 mr-2 text-red-500" />
                  <span>Store</span>
                </li>
              </ul>
            </div>

            {/* User Management Section */}
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <UserCheck className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-medium">User Management</h3>
              </div>
              <p className="text-gray-700 mb-4">Configure user accounts, roles, and permissions.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-red-500" />
                  <span>Role</span>
                </li>
                <li className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-red-500" />
                  <span>Currency</span>
                </li>
                <li className="flex items-center">
                  <Landmark className="h-4 w-4 mr-2 text-red-500" />
                  <span>Bank</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
