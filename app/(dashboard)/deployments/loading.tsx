import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "../components/skeletons/table-skeleton"

export default function DeploymentsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      {/* Table skeleton */}
      <TableSkeleton rows={8} columns={4} />
    </div>
  )
}
