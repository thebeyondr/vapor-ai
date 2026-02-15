"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db/client"
import { trainingJobs, deployments } from "@/lib/db/schema"
import { eq, count, and } from "drizzle-orm"

type ActionResult =
  | { success: true; deploymentId: number }
  | { success: false; error: string }

/**
 * Deploy a completed training job
 * Creates a deployment record with auto-generated version and endpoint
 */
export async function deployTrainingJob(jobId: number): Promise<ActionResult> {
  try {
    // 1. Validate job exists and is complete (not cached - needs fresh data)
    const [job] = await db
      .select()
      .from(trainingJobs)
      .where(eq(trainingJobs.id, jobId))

    if (!job) {
      return { success: false, error: "Training job not found" }
    }

    if (job.status !== "complete") {
      return { success: false, error: "Only completed training jobs can be deployed" }
    }

    // 2. Check if job already has an active deployment
    const [existingActiveDeployment] = await db
      .select()
      .from(deployments)
      .where(
        and(
          eq(deployments.jobId, jobId),
          eq(deployments.status, "active")
        )
      )

    if (existingActiveDeployment) {
      return { success: false, error: "This job already has an active deployment" }
    }

    // 3. Generate next version number for this model
    const [versionCount] = await db
      .select({ count: count() })
      .from(deployments)
      .where(eq(deployments.modelName, job.modelName))

    const nextVersion = `v1.${versionCount?.count ?? 0}.0` // Semantic versioning

    // 4. Create deployment record (skip "deploying" state for demo - instant deployment)
    const modelSlug = job.modelName.toLowerCase().replace(/\s+/g, "-")
    const endpoint = `/api/inference/${modelSlug}/${nextVersion}`

    const [newDeployment] = await db
      .insert(deployments)
      .values({
        jobId: job.id,
        modelName: job.modelName,
        version: nextVersion,
        status: "active",
        endpoint,
      })
      .returning({ id: deployments.id })

    // 5. Revalidate relevant paths
    revalidatePath("/")
    revalidatePath("/deployments")
    revalidatePath("/training/jobs")
    revalidatePath(`/training/jobs/${jobId}`)

    return { success: true, deploymentId: newDeployment.id }

  } catch (error) {
    console.error("Failed to deploy training job:", error)
    return { success: false, error: "Failed to create deployment" }
  }
}
