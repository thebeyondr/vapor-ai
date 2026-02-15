import { cache } from "react"
import { db } from "./client"
import { trainingJobs, trainingMetrics } from "./schema"
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
