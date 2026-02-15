import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "./status-badge"
import { EmptyState } from "./empty-state"
import { trainingJobs } from "@/lib/db/schema"
import { FolderOpen } from "lucide-react"

type TrainingJob = typeof trainingJobs.$inferSelect

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
}

export function RecentJobsList({ jobs }: { jobs: TrainingJob[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No training jobs yet"
        description="Start your first training job to fine-tune a model on your data."
        actionLabel="Start Training"
        actionHref="/training"
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Training Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{job.name}</p>
                <p className="text-sm text-muted-foreground">{job.modelName}</p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={job.status} />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(job.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link
            href="/training"
            className="text-sm text-primary hover:underline"
          >
            View All Jobs
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
