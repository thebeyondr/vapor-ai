import { config } from "dotenv"

// Load .env.local BEFORE importing db client
config({ path: ".env.local" })

import { faker } from "@faker-js/faker"
import { db } from "../lib/db/client"
import { trainingJobs, trainingMetrics } from "../lib/db/schema"
import { TrainingSimulator } from "../lib/services/training-simulator"

async function seed() {
  try {
    console.log("Seeding database...")

    // Set seed for deterministic output
    faker.seed(42)

    // Clear existing data
    await db.delete(trainingMetrics)
    await db.delete(trainingJobs)
    console.log("✓ Cleared existing data")

    // Generate 15-20 training jobs
    const jobCount = faker.number.int({ min: 15, max: 20 })
    const modelNames = ["LFM-1B", "LFM-3B", "LFM-Nano", "LFM-7B-Vision", "LFM-Audio-1B"]

    // Weighted distribution: ~3 queued, ~4 running, ~8 complete, ~2 failed
    const statusWeights = [
      ...Array(3).fill("queued"),
      ...Array(4).fill("running"),
      ...Array(8).fill("complete"),
      ...Array(2).fill("failed"),
    ] as const

    const jobs = []
    for (let i = 0; i < jobCount; i++) {
      jobs.push({
        name: faker.company.catchPhrase(),
        status: statusWeights[i % statusWeights.length],
        modelName: faker.helpers.arrayElement(modelNames),
        epochs: faker.number.int({ min: 5, max: 50 }),
        learningRate: faker.number.float({ min: 0.0001, max: 0.01, fractionDigits: 4 }),
        createdAt: faker.date.recent({ days: 14 }),
      })
    }

    // Insert jobs and get IDs back
    const insertedJobs = await db.insert(trainingJobs).values(jobs).returning()
    console.log(`✓ Inserted ${jobCount} training jobs`)

    // Generate metrics for complete/running/failed jobs using TrainingSimulator
    const simulator = new TrainingSimulator()
    let totalMetrics = 0

    for (const job of insertedJobs) {
      if (job.status === "queued") continue

      const totalSteps = job.epochs * 100
      const stepsPerEpoch = 100

      // Running jobs: generate ~30-70% of metrics
      // Complete jobs: generate all metrics
      // Failed jobs: generate ~10-40% then stop
      let stepsToGenerate: number
      if (job.status === "complete") {
        stepsToGenerate = totalSteps
      } else if (job.status === "running") {
        stepsToGenerate = Math.floor(totalSteps * faker.number.float({ min: 0.3, max: 0.7 }))
      } else {
        // failed
        stepsToGenerate = Math.floor(totalSteps * faker.number.float({ min: 0.1, max: 0.4 }))
      }

      const metrics = simulator.generateMetricsBatch(1, stepsToGenerate, totalSteps, stepsPerEpoch)

      // Insert in batches of 500 to avoid query size limits
      const batchSize = 500
      for (let i = 0; i < metrics.length; i += batchSize) {
        const batch = metrics.slice(i, i + batchSize).map((m) => ({
          jobId: job.id,
          epoch: m.epoch,
          step: m.step,
          loss: m.loss,
          accuracy: m.accuracy,
          learningRate: job.learningRate,
        }))
        await db.insert(trainingMetrics).values(batch)
      }

      totalMetrics += stepsToGenerate
    }

    console.log(`✓ Generated ${totalMetrics} metric points across jobs`)
    console.log("\n✓ Database seeded successfully!")
  } catch (error) {
    console.error("✗ Database seeding failed:", error)
    process.exit(1)
  }
}

seed()
