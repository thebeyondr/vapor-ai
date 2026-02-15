import { db } from "@/lib/db/client"
import { trainingJobs, trainingMetrics } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+ - params is a Promise
    const { id } = await params
    const jobId = parseInt(id, 10)

    if (isNaN(jobId)) {
      return Response.json(
        { error: "Invalid job ID" },
        { status: 400 }
      )
    }

    // Fetch job directly (no cache - polling needs fresh data)
    const [job] = await db
      .select()
      .from(trainingJobs)
      .where(eq(trainingJobs.id, jobId))

    if (!job) {
      return Response.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Fetch recent metrics
    const metrics = await db
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

    return Response.json({
      job,
      metrics,
    })
  } catch (error) {
    console.error("Failed to fetch training metrics:", error)
    return Response.json(
      { error: "Failed to fetch training metrics" },
      { status: 500 }
    )
  }
}
