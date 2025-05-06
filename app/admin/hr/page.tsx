import HRRedirect from "./redirect"
import { Users, FolderOpen, Layers, Briefcase, DollarSign, Calendar, BarChart, User } from "lucide-react"

export default function HRDashboard() {
  return (
    <>
      <HRRedirect />
      <div>
        <div className="bg-red-600 text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-medium flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Human Resources Management
          </h1>
        </div>

        <div className="bg-white rounded-b-lg p-6 shadow-md">
          <p className="text-gray-700 mb-6">
            Welcome to the Human Resources Management module. Use the sidebar navigation to access different HR
            functions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personnel Management Section */}
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-medium">Personnel Management</h3>
              </div>
              <p className="text-gray-700 mb-4">Manage employee records, departments, and organizational structure.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-red-500" />
                  <span>Employee</span>
                </li>
                <li className="flex items-center">
                  <FolderOpen className="h-4 w-4 mr-2 text-red-500" />
                  <span>Department</span>
                </li>
                <li className="flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-red-500" />
                  <span>Section</span>
                </li>
                <li className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-red-500" />
                  <span>Position</span>
                </li>
              </ul>
            </div>

            {/* Compensation & Benefits Section */}
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <DollarSign className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-medium">Compensation & Benefits</h3>
              </div>
              <p className="text-gray-700 mb-4">Manage pay types, leave policies, and compensation structures.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-red-500" />
                  <span>Pay Type</span>
                </li>
                <li className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-red-500" />
                  <span>Leave Type</span>
                </li>
                <li className="flex items-center">
                  <BarChart className="h-4 w-4 mr-2 text-red-500" />
                  <span>Pay Grade</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
