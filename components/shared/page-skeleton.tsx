import { Skeleton } from "@/components/ui/skeleton"

/** DashboardPageSkeleton — loading placeholder matching dashboard layout. */
export function DashboardPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Loading dashboard">
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-64 rounded-xl xl:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

/** PageSkeleton — generic page loading state for list/form pages. */
export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Loading page">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
