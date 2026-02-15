import { getAllDeployments } from "@/lib/db/queries"
import { generateInferenceMetrics } from "@/lib/services/inference-simulator"
import { DeploymentsTable } from "./components/deployments-table"
import type { DeploymentRow } from "./components/deployment-columns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
        <Card>
          <CardHeader>
            <CardTitle>No deployments yet</CardTitle>
            <CardDescription>
              Deploy a completed training job to start serving models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/training/jobs">View training jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DeploymentsTable data={deploymentsWithMetrics} />
      )}
    </div>
  )
}
