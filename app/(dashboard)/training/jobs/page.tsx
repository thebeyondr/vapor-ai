import { getAllJobs } from "@/lib/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/app/(dashboard)/components/status-badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { JobActions } from "./job-actions"

export default async function TrainingJobsPage() {
  const jobs = await getAllJobs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Jobs</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your training runs
          </p>
        </div>
        <Button asChild>
          <Link href="/training/configure">
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No training jobs yet</CardTitle>
            <CardDescription>
              Create your first training job to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/training/configure">
                <Plus className="mr-2 h-4 w-4" />
                Create Training Job
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{job.name}</CardTitle>
                    <CardDescription>
                      Model: {job.modelName}
                    </CardDescription>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Epochs</p>
                      <p className="font-medium">{job.epochs}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Learning Rate</p>
                      <p className="font-medium">{job.learningRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <JobActions job={job} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
