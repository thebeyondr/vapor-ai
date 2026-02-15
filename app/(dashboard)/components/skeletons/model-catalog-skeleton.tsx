import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function ModelCatalogSkeleton() {
  return (
    <div className="space-y-8">
      {/* Page header skeleton */}
      <div>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-full max-w-2xl mt-2" />
      </div>

      {/* AI Recommender hero card skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>

      <Separator className="my-12" />

      {/* Liquid LFM section skeleton */}
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-5 w-full max-w-xl mt-2" />
        </div>

        {/* Model cards grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-12" />

      {/* Search section skeleton */}
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
    </div>
  )
}
