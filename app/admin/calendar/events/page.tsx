import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EventsPage() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <CalendarDays className="h-5 w-5 mr-2" />
          Events Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100">
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Organizer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">EVT-{1000 + item}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {
                        ["Annual Conference", "Team Building", "Product Launch", "Board Meeting", "Training Workshop"][
                          item - 1
                        ]
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {["15/04/2025", "20/04/2025", "05/05/2025", "10/05/2025", "15/05/2025"][item - 1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {["09:00 - 17:00", "10:00 - 16:00", "14:00 - 17:00", "09:00 - 12:00", "09:00 - 15:00"][item - 1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {["Conference Center", "Beach Resort", "Main Office", "Board Room", "Training Room"][item - 1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {["HR Department", "Admin Team", "Marketing Team", "CEO Office", "HR Department"][item - 1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item === 1
                          ? "bg-green-100 text-green-800"
                          : item === 2
                            ? "bg-blue-100 text-blue-800"
                            : item === 3
                              ? "bg-yellow-100 text-yellow-800"
                              : item === 4
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item === 1
                        ? "Confirmed"
                        : item === 2
                          ? "In Planning"
                          : item === 3
                            ? "Pending"
                            : item === 4
                              ? "Rescheduled"
                              : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-red-600 hover:text-red-900 mr-3">
                      Edit
                    </a>
                    <a href="#" className="text-gray-600 hover:text-gray-900">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
