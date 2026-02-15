import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getJobCounts, getRecentJobs, getDeploymentCounts } from "@/lib/db/queries"
import { DashboardMetrics } from "./components/dashboard-metrics"
import { RecentJobsList } from "./components/recent-jobs-list"
import { WelcomeModal } from "./components/welcome-modal"

export default async function DashboardPage() {
  const [counts, recentJobs, deploymentCounts] = await Promise.all([
    getJobCounts(),
    getRecentJobs(5),
    getDeploymentCounts(),
  ])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor your training jobs and deployments
          </p>
        </div>
        <Button asChild>
          <Link href="/training">Start New Training</Link>
        </Button>
      </div>

      {/* Metrics Cards */}
      <DashboardMetrics
        activeJobs={counts.active}
        completedJobs={counts.completed}
        failedJobs={counts.failed}
        totalJobs={counts.total}
        deployedModels={deploymentCounts.active}
      />

      {/* Recent Jobs List */}
      <RecentJobsList jobs={recentJobs} />

      {/* Welcome Modal (Client Component island) */}
      <WelcomeModal />
    </div>
  )
}
