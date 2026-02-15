import { cache } from "react"
import { db } from "./client"
import { trainingJobs } from "./schema"
import { eq, desc, count, sql } from "drizzle-orm"

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
