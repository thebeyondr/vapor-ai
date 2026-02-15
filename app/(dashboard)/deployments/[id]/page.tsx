import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getDeployment, getTrainingJob } from "@/lib/db/queries"
import { generateInferenceMetrics } from "@/lib/services/inference-simulator"
import { InferenceStats } from "./components/inference-stats"
import { DeploymentStatusBadge } from "../components/deployment-status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DeploymentDetailPage({ params }: PageProps) {
  const { id } = await params
  const deploymentId = parseInt(id, 10)

  if (isNaN(deploymentId)) {
    notFound()
  }

  const deployment = await getDeployment(deploymentId)

  if (!deployment) {
    notFound()
  }

  // Generate inference metrics
  const metrics = generateInferenceMetrics(deployment)

  // Fetch source training job for context
  const sourceJob = await getTrainingJob(deployment.jobId)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/deployments"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Deployments
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{deployment.modelName}</h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">
              {deployment.version}
            </span>
            <DeploymentStatusBadge status={deployment.status as "deploying" | "active" | "paused" | "failed"} />
          </div>
        </div>
      </div>

      {/* Deployment info card */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Information</CardTitle>
          <CardDescription>Configuration and metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Endpoint</p>
              <p className="font-mono text-sm">{deployment.endpoint}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Source Job</p>
              <Link
                href={`/training/jobs/${deployment.jobId}`}
                className="text-sm font-medium hover:underline"
              >
                {sourceJob?.name || `Job #${deployment.jobId}`}
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deployed</p>
              <p className="text-sm font-medium">
                {format(new Date(deployment.createdAt), "PPpp")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-sm font-medium capitalize">{deployment.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inference stats - only show for active deployments */}
      {deployment.status === "active" ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Inference Metrics</h2>
            <p className="text-sm text-muted-foreground">
              Real-time performance statistics
            </p>
          </div>
          <InferenceStats metrics={metrics} />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Metrics unavailable — deployment is {deployment.status}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
