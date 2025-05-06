import { Skeleton } from "@/components/ui/skeleton"

export default function BankReportLoading() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium">
          <Skeleton className="h-6 w-32 bg-white/50" />
        </h1>
        <Skeleton className="h-10 w-36 bg-white/50 rounded" />
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-9 w-full rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-28" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
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
