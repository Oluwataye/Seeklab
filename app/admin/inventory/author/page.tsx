import { BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthorPage() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Author Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100">
          <Plus className="h-4 w-4 mr-1" /> Add Author
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
                  Author ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Biography
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Books Count
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">AUTH-{100 + item}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {["Chinua Achebe", "Chimamanda Adichie", "Wole Soyinka", "Ben Okri", "Buchi Emecheta"][item - 1]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {
                      [
                        "Nigerian novelist and poet",
                        "Award-winning Nigerian author",
                        "Nobel Prize-winning playwright",
                        "Nigerian poet and novelist",
                        "Nigerian-born novelist",
                      ][item - 1]
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {["12", "8", "15", "10", "7"][item - 1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
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
