import { getAllDeployments } from "@/lib/db/queries"
import { generateInferenceMetrics } from "@/lib/services/inference-simulator"
import { DeploymentsTable } from "./components/deployments-table"
import type { DeploymentRow } from "./components/deployment-columns"
import { EmptyState } from "../components/empty-state"
import { Rocket } from "lucide-react"

export default async function DeploymentsPage() {
  const deployments = await getAllDeployments()

  // Generate inference metrics for each deployment
  const deploymentsWithMetrics: DeploymentRow[] = deployments.map((deployment) => {
    const metrics = generateInferenceMetrics(deployment)
    return {
      id: deployment.id,
      modelName: deployment.modelName,
      version: deployment.version,
      status: deployment.status as "deploying" | "active" | "paused" | "failed",
      createdAt: new Date(deployment.createdAt),
      requestVolume: metrics.requestVolume,
      p95Latency: metrics.p95Latency,
      errorRate: metrics.errorRate,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground">
          Monitor deployed models and inference performance
        </p>
      </div>

      {deployments.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No deployments yet"
          description="Deploy a completed training job to start serving inference requests."
          actionLabel="View Training Jobs"
          actionHref="/training/jobs"
        />
      ) : (
        <DeploymentsTable data={deploymentsWithMetrics} />
      )}
    </div>
  )
}
