import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg mb-6">
        <Skeleton className="h-6 w-48 bg-red-500" />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="h-10 w-full mb-6" />

      <div className="rounded-md border">
        <div className="p-4">
          <div className="flex items-center justify-between py-2 border-b">
            <Skeleton className="h-5 w-[300px]" />
            <div className="flex space-x-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8" />
            </div>
          </div>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b">
                <Skeleton className="h-5 w-[300px]" />
                <div className="flex space-x-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-8" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
