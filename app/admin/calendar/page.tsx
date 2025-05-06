import { CalendarIcon } from "lucide-react"

export default function CalendarDashboard() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-medium flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Calendar Management
        </h1>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <p className="text-gray-700 mb-4">
          Welcome to the Calendar Management module. Use the sidebar navigation to access different calendar functions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Events</h2>
            <p className="text-gray-600 text-sm">Manage company events and activities.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Appointments</h2>
            <p className="text-gray-600 text-sm">Schedule and manage appointments with clients and partners.</p>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h2 className="font-medium text-lg mb-2">Schedule</h2>
            <p className="text-gray-600 text-sm">Manage staff schedules and work shifts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
