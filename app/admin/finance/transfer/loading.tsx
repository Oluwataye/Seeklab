import { Skeleton } from "@/components/ui/skeleton"

export default function TransferLoading() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Skeleton className="h-5 w-5 mr-2 bg-white/50" />
          <Skeleton className="h-6 w-48 bg-white/50" />
        </h1>
        <Skeleton className="h-9 w-32 bg-white/50" />
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-32" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
