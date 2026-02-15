"use server"

import { db } from "@/lib/db/client"
import { trainingJobs, trainingMetrics } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { TrainingSimulator } from "@/lib/services/training-simulator"

export type ActionResponse =
  | { success: true }
  | { success: false; error: string }

export type SimulateStepResponse =
  | { success: true; complete: boolean; progress: number }
  | { success: false; error: string }

/**
 * Start a queued training job
 * Transitions job from "queued" to "running" status
 */
export async function startTrainingJob(jobId: number): Promise<ActionResponse> {
  try {
    // Fetch job
    const [job] = await db
      .select()
      .from(trainingJobs)
      .where(eq(trainingJobs.id, jobId))

    if (!job) {
      return { success: false, error: "Job not found" }
    }

    // Validate status
    if (job.status !== "queued") {
      return { success: false, error: `Cannot start job with status: ${job.status}` }
    }

    // Update to running
    await db
      .update(trainingJobs)
      .set({
        status: "running",
        updatedAt: new Date(),
      })
      .where(eq(trainingJobs.id, jobId))

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/training/jobs")
    revalidatePath(`/training/jobs/${jobId}`)

    return { success: true }
  } catch (error) {
    console.error("Failed to start training job:", error)
    return { success: false, error: "Failed to start training job" }
  }
}

/**
 * Simulate a single training step
 * Generates one metric point and persists to database
 * Auto-completes job when all steps are done
 */
export async function simulateTrainingStep(jobId: number): Promise<SimulateStepResponse> {
  try {
    // Fetch job
    const [job] = await db
      .select()
      .from(trainingJobs)
      .where(eq(trainingJobs.id, jobId))

    if (!job) {
      return { success: false, error: "Job not found" }
    }

    // Validate status
    if (job.status !== "running") {
      return { success: false, error: `Cannot simulate step for job with status: ${job.status}` }
    }

    // Count existing metrics
    const [result] = await db
      .select({ count: count() })
      .from(trainingMetrics)
      .where(eq(trainingMetrics.jobId, jobId))

    const currentCount = result?.count ?? 0

    // Calculate progress
    const totalSteps = job.epochs * 100 // 100 steps per epoch
    const nextStep = currentCount + 1

    // Check if training is complete
    if (nextStep > totalSteps) {
      await db
        .update(trainingJobs)
        .set({
          status: "complete",
          updatedAt: new Date(),
        })
        .where(eq(trainingJobs.id, jobId))

      revalidatePath("/")
      revalidatePath("/training/jobs")
      revalidatePath(`/training/jobs/${jobId}`)

      return { success: true, complete: true, progress: 1 }
    }

    // Generate metric point
    const simulator = new TrainingSimulator()
    const stepsPerEpoch = 100
    const epoch = Math.floor((nextStep - 1) / stepsPerEpoch) + 1

    const loss = simulator.generateLossPoint(nextStep, totalSteps)
    const accuracy = simulator.generateAccuracy(loss)

    // Insert metric
    await db.insert(trainingMetrics).values({
      jobId,
      epoch,
      step: nextStep,
      loss,
      accuracy,
      learningRate: job.learningRate,
    })

    const progress = nextStep / totalSteps

    return { success: true, complete: false, progress }
  } catch (error) {
    console.error("Failed to simulate training step:", error)

    // Mark job as failed
    try {
      await db
        .update(trainingJobs)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(trainingJobs.id, jobId))

      revalidatePath("/")
      revalidatePath("/training/jobs")
      revalidatePath(`/training/jobs/${jobId}`)
    } catch (updateError) {
      console.error("Failed to update job to failed status:", updateError)
    }

    return { success: false, error: "Failed to simulate training step" }
  }
}

/**
 * Fail a training job
 * Transitions job to "failed" status
 */
export async function failTrainingJob(jobId: number): Promise<ActionResponse> {
  try {
    // Fetch job
    const [job] = await db
      .select()
      .from(trainingJobs)
      .where(eq(trainingJobs.id, jobId))

    if (!job) {
      return { success: false, error: "Job not found" }
    }

    // Validate status
    if (job.status !== "running" && job.status !== "queued") {
      return { success: false, error: `Cannot fail job with status: ${job.status}` }
    }

    // Update to failed
    await db
      .update(trainingJobs)
      .set({
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(trainingJobs.id, jobId))

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/training/jobs")
    revalidatePath(`/training/jobs/${jobId}`)

    return { success: true }
  } catch (error) {
    console.error("Failed to fail training job:", error)
    return { success: false, error: "Failed to update job status" }
  }
}
