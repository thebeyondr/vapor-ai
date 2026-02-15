import { config } from "dotenv"

// Load .env.local BEFORE importing db client
config({ path: ".env.local" })

import { faker } from "@faker-js/faker"
import { db } from "../lib/db/client"
import { trainingJobs } from "../lib/db/schema"

async function seed() {
  try {
    console.log("Seeding database...")

    // Set seed for deterministic output
    faker.seed(42)

    // Clear existing training jobs
    await db.delete(trainingJobs)
    console.log("✓ Cleared existing training jobs")

    // Generate 15-20 training jobs
    const jobCount = faker.number.int({ min: 15, max: 20 })
    const modelNames = ["LFM-1B", "LFM-3B", "LFM-Nano", "LFM-7B-Vision", "LFM-Audio-1B"]
    const statuses = ["queued", "running", "complete", "failed"] as const

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

    // Insert jobs
    await db.insert(trainingJobs).values(jobs)
    console.log(`✓ Inserted ${jobCount} training jobs`)

    console.log("\n✓ Database seeded successfully!")
  } catch (error) {
    console.error("✗ Database seeding failed:", error)
    process.exit(1)
  }
}

seed()
