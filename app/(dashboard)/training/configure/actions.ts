"use server"

import { db } from "@/lib/db/client"
import { trainingJobs } from "@/lib/db/schema"
import { trainingJobSchema, type TrainingJobInput } from "@/lib/validations/training-job"
import { revalidatePath } from "next/cache"

export type CreateJobResponse =
  | { success: true; jobId: number }
  | { success: false; error: string }

/**
 * Create a new training job in the database
 * Server-side validation + defense in depth pattern
 */
export async function createTrainingJob(input: TrainingJobInput): Promise<CreateJobResponse> {
  try {
    // Server-side validation (defense in depth)
    const validation = trainingJobSchema.safeParse(input)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input"
      }
    }

    const { name, modelId, learningRate, epochs, batchSize } = validation.data

    // Insert into database
    const [job] = await db
      .insert(trainingJobs)
      .values({
        name,
        modelName: modelId, // Map modelId to modelName column
        learningRate,
        epochs,
        batchSize,
        status: "queued"
      })
      .returning({ id: trainingJobs.id })

    // Revalidate caches so new job appears in dashboard and training pages
    revalidatePath("/")
    revalidatePath("/training")

    return {
      success: true,
      jobId: job.id
    }
  } catch (error) {
    console.error("Failed to create training job:", error)
    return {
      success: false,
      error: "Failed to create training job. Please try again."
    }
  }
}
