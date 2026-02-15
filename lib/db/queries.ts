import { cache } from "react"
import { db } from "./client"
import { trainingJobs, trainingMetrics, deployments } from "./schema"
import { eq, desc, count, sql, asc } from "drizzle-orm"

export const getJobCounts = cache(async () => {
  // Get counts for each status in parallel
  const [activeResult, completedResult, failedResult, totalResult] = await Promise.all([
    db
      .select({ count: count() })
      .from(trainingJobs)
      .where(sql`${trainingJobs.status} IN ('queued', 'running')`),
    db
      .select({ count: count() })
      .from(trainingJobs)
      .where(eq(trainingJobs.status, "complete")),
    db
      .select({ count: count() })
      .from(trainingJobs)
      .where(eq(trainingJobs.status, "failed")),
    db.select({ count: count() }).from(trainingJobs),
  ])

  return {
    active: activeResult[0]?.count ?? 0,
    completed: completedResult[0]?.count ?? 0,
    failed: failedResult[0]?.count ?? 0,
    total: totalResult[0]?.count ?? 0,
  }
})

export const getRecentJobs = cache(async (limit = 5) => {
  const jobs = await db
    .select()
    .from(trainingJobs)
    .orderBy(desc(trainingJobs.createdAt))
    .limit(limit)

  return jobs
})

export const getAllJobs = cache(async () => {
  const jobs = await db
    .select()
    .from(trainingJobs)
    .orderBy(desc(trainingJobs.createdAt))

  return jobs
})

export const getTrainingJob = cache(async (id: number) => {
  const [job] = await db
    .select()
    .from(trainingJobs)
    .where(eq(trainingJobs.id, id))

  return job
})

export const getTrainingMetrics = cache(async (jobId: number, limit = 200) => {
  const metrics = await db
    .select()
    .from(trainingMetrics)
    .where(eq(trainingMetrics.jobId, jobId))
    .orderBy(asc(trainingMetrics.step))
    .limit(limit)

  return metrics
})

// Deployment queries

export const getAllDeployments = cache(async () => {
  const allDeployments = await db
    .select()
    .from(deployments)
    .orderBy(desc(deployments.createdAt))

  return allDeployments
})

export const getDeployment = cache(async (id: number) => {
  const [deployment] = await db
    .select()
    .from(deployments)
    .where(eq(deployments.id, id))

  return deployment
})

export const getDeploymentCounts = cache(async () => {
  const [activeResult, pausedResult, failedResult, totalResult] = await Promise.all([
    db
      .select({ count: count() })
      .from(deployments)
      .where(eq(deployments.status, "active")),
    db
      .select({ count: count() })
      .from(deployments)
      .where(eq(deployments.status, "paused")),
    db
      .select({ count: count() })
      .from(deployments)
      .where(eq(deployments.status, "failed")),
    db.select({ count: count() }).from(deployments),
  ])

  return {
    active: activeResult[0]?.count ?? 0,
    paused: pausedResult[0]?.count ?? 0,
    failed: failedResult[0]?.count ?? 0,
    total: totalResult[0]?.count ?? 0,
  }
})

export const getDeploymentsByJobId = cache(async (jobId: number) => {
  const jobDeployments = await db
    .select()
    .from(deployments)
    .where(eq(deployments.jobId, jobId))

  return jobDeployments
})
