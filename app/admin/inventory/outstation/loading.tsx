import { Skeleton } from "@/components/ui/skeleton"

export default function OutstationLoading() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <Skeleton className="h-8 w-64 bg-red-400" />
        <Skeleton className="h-10 w-40 bg-red-400" />
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex justify-end">
          <Skeleton className="h-10 w-64 bg-gray-200" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(7)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <Skeleton className="h-5 w-full bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
