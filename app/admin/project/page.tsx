import { Briefcase } from "lucide-react"

export default function ProjectDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Project Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Project Management module. Use the sidebar navigation to access different project functions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Projects</h2>
            <p className="text-gray-600 text-sm">Manage all company projects, track progress, and view details.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Tasks</h2>
            <p className="text-gray-600 text-sm">Create and assign tasks, set deadlines, and monitor completion.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Teams</h2>
            <p className="text-gray-600 text-sm">
              Organize project teams, assign members, and manage responsibilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
