import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { eq, asc } from "drizzle-orm"
import { db } from "@/lib/db/client"
import { trainingJobs, trainingMetrics } from "@/lib/db/schema"
import { TrainingMonitor } from "./components/training-monitor"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TrainingJobPage({ params }: PageProps) {
  // Next.js 15+ - params is a Promise
  const { id } = await params
  const jobId = parseInt(id, 10)

  if (isNaN(jobId)) {
    notFound()
  }

  // Fetch job (not cached - needs fresh data)
  const [job] = await db
    .select()
    .from(trainingJobs)
    .where(eq(trainingJobs.id, jobId))

  if (!job) {
    notFound()
  }

  // Fetch initial metrics (limited to 200 most recent)
  const initialMetrics = await db
    .select({
      step: trainingMetrics.step,
      loss: trainingMetrics.loss,
      accuracy: trainingMetrics.accuracy,
      epoch: trainingMetrics.epoch,
    })
    .from(trainingMetrics)
    .where(eq(trainingMetrics.jobId, jobId))
    .orderBy(asc(trainingMetrics.step))
    .limit(200)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/training/jobs"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">{job.name}</h1>
        <p className="text-muted-foreground">
          {job.modelName} &middot; {job.epochs} epochs &middot; LR {job.learningRate}
        </p>
      </div>

      {/* Training monitor */}
      <TrainingMonitor job={job} initialMetrics={initialMetrics} />
    </div>
  )
}
