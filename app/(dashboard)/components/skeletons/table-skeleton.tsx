import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <Card>
      <div className="p-4">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b pb-3 mb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 w-24" />
          ))}
        </div>

        {/* Table rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-4"
                  style={{
                    width: colIndex === 0 ? '180px' : colIndex === 1 ? '100px' : colIndex === 2 ? '80px' : '120px'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
